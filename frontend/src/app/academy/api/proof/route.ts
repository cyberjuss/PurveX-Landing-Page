import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { AVAILABILITY, CLEARANCE, SHOTS_PER_ITEM, WORK_AUTH, type ExtraCert } from "@/lib/academy-proof";
import { loadProofData, shareBlockers } from "@/lib/academy-proof-data";
import {
  addShot,
  deleteShot,
  loadProofSettings,
  newCredentialId,
  putFile,
  removeFile,
  saveProofSettings,
  slugify,
  validSlug,
  type ProofSettings,
} from "@/lib/academy-proof-store";
import { isRangePro, proRequired } from "@/lib/range-plan";
import { getAcademyStudent, type AcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Vercel caps a request body at 4.5 MB, so uploads stop just under it.
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["image/png", "image/jpeg"]);

// Reading a draft is open to everyone -- a free student can see the profile
// their work has already earned, which is the whole argument for upgrading.
// Everything that writes needs Pro, because what Pro sells is the published,
// verifiable page, not the draft behind it.
//
// Deliberately not applied to /p/[slug]: a profile that is already public
// stays public if a subscription lapses. Pulling a student's portfolio
// offline mid-application over a declined card does more harm than the
// entitlement is worth.
async function auth(request: Request, requirePro = true) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) } as const;
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) } as const;
  const pro = await isRangePro(student);
  if (requirePro && !pro) {
    return { error: NextResponse.json(proRequired("A shareable Proof Profile"), { status: 403 }) } as const;
  }
  return { student, pro } as const;
}

/** An unpublished starting point for a student who has not saved anything yet. */
function draftSettings(student: AcademyStudent, shotsOn: string[]): ProofSettings {
  const name = draftName(student);
  return { slug: slugify(name), displayName: name, published: false, showSkills: true, shotsOn, credentialId: newCredentialId(), updatedAt: new Date().toISOString() };
}

function emailName(email: string | null) {
  const local = (email ?? "").split("@")[0] ?? "";
  const words = local.split(/[._-]+/).filter(Boolean).slice(0, 3);
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "Student";
}

/** The name on the student's account, falling back to one built from their email. */
function draftName(student: AcademyStudent) {
  return student.name || emailName(student.email);
}

export async function GET(request: Request) {
  const a = await auth(request, false);
  if (a.error) return a.error;
  const data = await loadProofData(a.student.id);
  // Portfolios created before account names were read still carry the email
  // placeholder; swap in the real name while keeping the link unchanged.
  if (data.settings && a.student.name && data.settings.displayName === emailName(a.student.email) && a.student.name !== data.settings.displayName) {
    const renamed = { ...data.settings, displayName: a.student.name, updatedAt: new Date().toISOString() };
    if ((await saveProofSettings(a.student.id, renamed)) === "ok") data.settings = renamed;
  }
  const name = data.settings?.displayName ?? draftName(a.student);
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
    blockers: shareBlockers(data.items),
    locked: !a.pro,
    ...(a.pro ? {} : { upgrade: "/range/upgrade" }),
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
  const displayName = String(body.displayName ?? prev?.displayName ?? draftName(a.student)).replace(/\s+/g, " ").trim().slice(0, 60);
  const slug = String(body.slug ?? prev?.slug ?? slugify(displayName)).toLowerCase().trim();
  if (!displayName) return NextResponse.json({ error: "Add the name employers should see." }, { status: 400 });
  if (!validSlug(slug)) return NextResponse.json({ error: "Use 3 to 40 lowercase letters, numbers or hyphens for your link." }, { status: 400 });
  const jobs = new Set(data.items.map((i) => i.job));
  // Contact and availability: optional, checked here because they go public.
  const text = (v: unknown, prevV: string | null | undefined, max: number) => (v === undefined ? prevV ?? null : String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max) || null);
  const contactEmail = text(body.contactEmail, prev?.contactEmail, 120);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return NextResponse.json({ error: "Enter an email address like name@example.com." }, { status: 400 });
  let linkedinUrl = text(body.linkedinUrl, prev?.linkedinUrl, 200);
  if (linkedinUrl && !/^https?:\/\//i.test(linkedinUrl)) linkedinUrl = `https://${linkedinUrl}`;
  if (linkedinUrl && !/^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/i.test(linkedinUrl.replace(/^http:/i, "https:"))) {
    return NextResponse.json({ error: "Use your LinkedIn profile link, like linkedin.com/in/your-name." }, { status: 400 });
  }
  if (linkedinUrl) linkedinUrl = linkedinUrl.replace(/^http:/i, "https:");
  let githubUrl = text(body.githubUrl, prev?.githubUrl, 200);
  if (githubUrl && !/^https?:\/\//i.test(githubUrl)) githubUrl = `https://${githubUrl}`;
  if (githubUrl && !/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/i.test(githubUrl)) {
    return NextResponse.json({ error: "Use your GitHub profile link, like github.com/your-name." }, { status: 400 });
  }
  if (githubUrl) githubUrl = githubUrl.replace(/^http:/i, "https:");
  let websiteUrl = text(body.websiteUrl, prev?.websiteUrl, 200);
  if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) websiteUrl = `https://${websiteUrl}`;
  if (websiteUrl) {
    try {
      const u = new URL(websiteUrl);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) throw new Error("bad");
    } catch {
      return NextResponse.json({ error: "Enter your website address, like yourname.com." }, { status: 400 });
    }
  }
  const location = text(body.location, prev?.location, 60);
  const availability = text(body.availability, prev?.availability, 40);
  if (availability && !(AVAILABILITY as readonly string[]).includes(availability)) return NextResponse.json({ error: "Pick when you can start from the list." }, { status: 400 });
  const workAuth = text(body.workAuth, prev?.workAuth, 60);
  if (workAuth && !(WORK_AUTH as readonly string[]).includes(workAuth)) return NextResponse.json({ error: "Pick your work authorization from the list." }, { status: 400 });
  const clearance = text(body.clearance, prev?.clearance, 60);
  if (clearance && !(CLEARANCE as readonly string[]).includes(clearance)) return NextResponse.json({ error: "Pick your clearance from the list." }, { status: 400 });
  let extraCerts: ExtraCert[] = prev?.extraCerts ?? [];
  if (Array.isArray(body.extraCerts)) {
    extraCerts = [];
    for (const raw of body.extraCerts.slice(0, 12)) {
      const c = raw as Partial<ExtraCert>;
      const certName = String(c.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (!certName) continue;
      if (c.status !== "earned" && c.status !== "booked" && c.status !== "studying") {
        return NextResponse.json({ error: `Pick a status for ${certName}.` }, { status: 400 });
      }
      const date = typeof c.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(c.date) ? c.date : undefined;
      extraCerts.push({ name: certName, status: c.status, ...(date && c.status !== "studying" ? { date } : {}) });
    }
  }
  const shotsOn = (Array.isArray(body.shotsOn) ? body.shotsOn : prev?.shotsOn ?? []).filter((j): j is string => typeof j === "string" && jobs.has(j));
  const published = body.published ?? prev?.published ?? false;
  if (published) {
    const blockers = shareBlockers(data.items);
    if (blockers.length) return NextResponse.json({ error: blockers[0], blockers }, { status: 400 });
  }
  const next: ProofSettings = {
    slug,
    displayName,
    published,
    showSkills: body.showSkills ?? prev?.showSkills ?? true,
    shotsOn,
    avatarPath: prev?.avatarPath ?? null,
    resumePath: prev?.resumePath ?? null,
    contactEmail,
    linkedinUrl,
    githubUrl,
    websiteUrl,
    location,
    availability,
    workAuth,
    clearance,
    extraCerts,
    credentialId: prev?.credentialId || newCredentialId(),
    updatedAt: new Date().toISOString(),
  };
  const saved = await saveProofSettings(a.student.id, next);
  if (saved === "taken") return NextResponse.json({ error: "That link is taken. Try another." }, { status: 409 });
  if (saved === "error") return NextResponse.json({ error: "Unable to save your portfolio right now. Try again later." }, { status: 500 });
  return NextResponse.json({ settings: next, blockers: shareBlockers(data.items) });
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
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Upload a file under 4 MB." }, { status: 400 });

  // A profile photo or resume replaces the last one.
  const kind = form.get("kind");
  if (kind === "avatar" || kind === "resume") {
    if (kind === "avatar" && !TYPES.has(file.type)) return NextResponse.json({ error: "Upload a PNG or JPEG photo." }, { status: 400 });
    if (kind === "resume" && file.type !== "application/pdf") return NextResponse.json({ error: "Upload your resume as a PDF." }, { status: 400 });
    const what = kind === "avatar" ? "photo" : "resume";
    const path = await putFile(a.student.id, kind, Buffer.from(await file.arrayBuffer()), file.type);
    if (!path) return NextResponse.json({ error: `Unable to save your ${what} right now. Try again later.` }, { status: 500 });
    const settings = (await loadProofSettings(a.student.id)) ?? draftSettings(a.student, []);
    const old = kind === "avatar" ? settings.avatarPath : settings.resumePath;
    const patch = kind === "avatar" ? { avatarPath: path } : { resumePath: path };
    const saved = await saveProofSettings(a.student.id, { ...settings, ...patch, updatedAt: new Date().toISOString() });
    if (saved !== "ok") {
      await removeFile(path);
      return NextResponse.json({ error: `Unable to save your ${what} right now. Try again later.` }, { status: 500 });
    }
    if (old) await removeFile(old);
    return NextResponse.json(patch);
  }
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "Upload a PNG or JPEG screenshot." }, { status: 400 });
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
    const name = draftName(a.student);
    const draft = draftSettings(a.student, [job]);
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
  const query = new URL(request.url).searchParams;
  if (query.get("avatar") === "1" || query.get("resume") === "1") {
    const settings = await loadProofSettings(a.student.id);
    const path = query.get("avatar") === "1" ? settings?.avatarPath : settings?.resumePath;
    if (settings && path) {
      const patch = query.get("avatar") === "1" ? { avatarPath: null } : { resumePath: null };
      await saveProofSettings(a.student.id, { ...settings, ...patch, updatedAt: new Date().toISOString() });
      await removeFile(path);
    }
    return NextResponse.json({ ok: true });
  }
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const ok = await deleteShot(a.student.id, id);
  if (!ok) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
