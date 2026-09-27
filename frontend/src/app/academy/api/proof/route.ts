import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { SHOTS_PER_ITEM } from "@/lib/academy-proof";
import { loadProofData, shareBlockers } from "@/lib/academy-proof-data";
import {
  addShot,
  deleteShot,
  listShots,
  loadProofSettings,
  newCredentialId,
  putAvatar,
  removeFile,
  saveProofSettings,
  slugify,
  validSlug,
  type ProofSettings,
} from "@/lib/academy-proof-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Vercel caps a request body at 4.5 MB, so uploads stop just under it.
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["image/png", "image/jpeg"]);

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) } as const;
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) } as const;
  return { student } as const;
}

/** An unpublished starting point for a student who has not saved anything yet. */
function draftSettings(email: string | null, shotsOn: string[]): ProofSettings {
  const name = draftName(email);
  return { slug: slugify(name), displayName: name, published: false, showSkills: true, shotsOn, avatarPath: null, credentialId: newCredentialId(), updatedAt: new Date().toISOString() };
}

function draftName(email: string | null) {
  const local = (email ?? "").split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean).slice(0, 3);
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "Student";
}

export async function GET(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  const data = await loadProofData(a.student.id);
  const name = data.settings?.displayName ?? draftName(a.student.email);
  const settings: ProofSettings = data.settings ?? {
    slug: slugify(name),
    displayName: name,
    published: false,
    showSkills: true,
    shotsOn: [],
    credentialId: "",
    updatedAt: "",
  };
  return NextResponse.json({
    ...data,
    settings,
    saved: Boolean(data.settings),
    shots: data.shots.map(({ id, job, caption }) => ({ id, job, caption })),
    blockers: shareBlockers(data.items, settings.shotsOn, data.shots),
  });
}

export async function PUT(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  let body: Partial<ProofSettings>;
  try {
    body = (await request.json()) as Partial<ProofSettings>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const data = await loadProofData(a.student.id);
  const prev = data.settings;
  const displayName = String(body.displayName ?? prev?.displayName ?? draftName(a.student.email)).replace(/\s+/g, " ").trim().slice(0, 60);
  const slug = String(body.slug ?? prev?.slug ?? slugify(displayName)).toLowerCase().trim();
  if (!displayName) return NextResponse.json({ error: "Add the name employers should see." }, { status: 400 });
  if (!validSlug(slug)) return NextResponse.json({ error: "Use 3 to 40 lowercase letters, numbers or hyphens for your link." }, { status: 400 });
  const jobs = new Set(data.items.map((i) => i.job));
  const shotsOn = (Array.isArray(body.shotsOn) ? body.shotsOn : prev?.shotsOn ?? []).filter((j): j is string => typeof j === "string" && jobs.has(j));
  const published = body.published ?? prev?.published ?? false;
  if (published) {
    const blockers = shareBlockers(data.items, shotsOn, data.shots);
    if (blockers.length) return NextResponse.json({ error: blockers[0], blockers }, { status: 400 });
  }
  const next: ProofSettings = {
    slug,
    displayName,
    published,
    showSkills: body.showSkills ?? prev?.showSkills ?? true,
    shotsOn,
    avatarPath: prev?.avatarPath ?? null,
    credentialId: prev?.credentialId || newCredentialId(),
    updatedAt: new Date().toISOString(),
  };
  const saved = await saveProofSettings(a.student.id, next);
  if (saved === "taken") return NextResponse.json({ error: "That link is taken. Try another." }, { status: 409 });
  if (saved === "error") return NextResponse.json({ error: "Unable to save your portfolio right now. Try again later." }, { status: 500 });
  return NextResponse.json({ settings: next, blockers: shareBlockers(data.items, shotsOn, data.shots) });
}

// Upload one screenshot to a lab work item.
export async function POST(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const job = String(form.get("job") ?? "");
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "Upload a PNG or JPEG image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Upload an image under 4 MB." }, { status: 400 });

  // A profile photo replaces the last one.
  if (form.get("kind") === "avatar") {
    const path = await putAvatar(a.student.id, Buffer.from(await file.arrayBuffer()), file.type);
    if (!path) return NextResponse.json({ error: "Unable to save your photo right now. Try again later." }, { status: 500 });
    const settings = (await loadProofSettings(a.student.id)) ?? draftSettings(a.student.email, []);
    const saved = await saveProofSettings(a.student.id, { ...settings, avatarPath: path, updatedAt: new Date().toISOString() });
    if (saved !== "ok") {
      await removeFile(path);
      return NextResponse.json({ error: "Unable to save your photo right now. Try again later." }, { status: 500 });
    }
    if (settings.avatarPath) await removeFile(settings.avatarPath);
    return NextResponse.json({ avatarPath: path });
  }
  const data = await loadProofData(a.student.id);
  if (!data.items.some((i) => i.job === job)) return NextResponse.json({ error: "That lab task is not in your portfolio yet." }, { status: 400 });
  if (data.shots.filter((s) => s.job === job).length >= SHOTS_PER_ITEM) {
    return NextResponse.json({ error: `This task already has ${SHOTS_PER_ITEM} screenshots. Remove one first.` }, { status: 400 });
  }
  const caption = String(form.get("caption") ?? "").replace(/\s+/g, " ").trim().slice(0, 140);
  const shot = await addShot(a.student.id, job, Buffer.from(await file.arrayBuffer()), file.type, caption);
  if (!shot) return NextResponse.json({ error: "Unable to save the screenshot right now. Try again later." }, { status: 500 });

  // Adding a screenshot switches that task's screenshots on. A student who
  // has not saved a profile yet gets an unpublished draft to hold it.
  const settings = await loadProofSettings(a.student.id);
  if (!settings) {
    const name = draftName(a.student.email);
    const draft = draftSettings(a.student.email, [job]);
    if ((await saveProofSettings(a.student.id, draft)) === "taken") {
      await saveProofSettings(a.student.id, { ...draft, slug: slugify(`${name} ${Math.random().toString(36).slice(2, 6)}`) });
    }
  } else if (!settings.shotsOn.includes(job)) {
    await saveProofSettings(a.student.id, { ...settings, shotsOn: [...settings.shotsOn, job], updatedAt: new Date().toISOString() });
  }
  return NextResponse.json({ shot: { id: shot.id, job: shot.job, caption: shot.caption } });
}

export async function DELETE(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  if (new URL(request.url).searchParams.get("avatar") === "1") {
    const settings = await loadProofSettings(a.student.id);
    if (settings?.avatarPath) {
      await saveProofSettings(a.student.id, { ...settings, avatarPath: null, updatedAt: new Date().toISOString() });
      await removeFile(settings.avatarPath);
    }
    return NextResponse.json({ ok: true });
  }
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const ok = await deleteShot(a.student.id, id);
  if (!ok) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  // Unpublish if removing it leaves a switched-on task short.
  const settings = await loadProofSettings(a.student.id);
  if (settings?.published) {
    const data = await loadProofData(a.student.id);
    if (shareBlockers(data.items, settings.shotsOn, await listShots(a.student.id)).length) {
      await saveProofSettings(a.student.id, { ...settings, published: false, updatedAt: new Date().toISOString() });
    }
  }
  return NextResponse.json({ ok: true });
}
