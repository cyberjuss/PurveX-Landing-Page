import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PUT } from "@/app/academy/api/proof/route";
import { findProofByCredential, findProofBySlug } from "@/lib/academy-proof-store";
import { createClass, joinClass } from "@/lib/academy-classes";
import { PRO_ONLY, setMemoryPro } from "@/lib/academy-plan";
import { newStudent, req, type TestStudent } from "./helpers";

const state = vi.hoisted(() => ({ student: null as TestStudent | null }));

vi.mock("@/lib/supabase-admin", () => ({ supabaseAdmin: null }));
vi.mock("@/lib/academy-auth", () => ({ isAcademyUnlocked: async () => true }));
vi.mock("@/lib/academy-student", () => ({ getAcademyStudent: async () => state.student }));
// A real portfolio needs proven lab work before it can be shared. That rule is not what is tested here.
vi.mock("@/lib/academy-proof-data", async (original) => ({
  ...(await original<typeof import("@/lib/academy-proof-data")>()),
  shareBlockers: () => [],
}));

let n = 0;
const slug = () => `student-${Date.now().toString(36)}-${n++}`;
const save = (body: Record<string, unknown>) => PUT(req("/academy/api/proof", { method: "PUT", body: { displayName: "Test Student", ...body } }));

describe("Portfolio by plan", () => {
  beforeEach(() => {
    state.student = newStudent();
  });

  it("saves a Free portfolio but will not publish it", async () => {
    const link = slug();
    expect((await save({ slug: link })).status).toBe(200);
    const res = await save({ slug: link, published: true });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe(PRO_ONLY.publish);
    expect((await findProofBySlug(link))?.settings.published).toBe(false);
  });

  it("publishes a Pro portfolio at its link and credential", async () => {
    setMemoryPro(state.student!.id, null);
    const link = slug();
    const res = await save({ slug: link, published: true });
    expect(res.status).toBe(200);
    const { settings } = await res.json();
    expect((await findProofBySlug(link))?.settings.published).toBe(true);
    expect((await findProofByCredential(settings.credentialId))?.settings.published).toBe(true);
  });

  it("lets a class seat publish", async () => {
    const cls = await createClass("Proof Cohort", "teacher@example.com");
    await joinClass(cls!.id, state.student!);
    const link = slug();
    expect((await save({ slug: link, published: true })).status).toBe(200);
    expect((await findProofBySlug(link))?.settings.published).toBe(true);
  });

  it("takes the public page and credential down when Pro ends, and keeps the work", async () => {
    setMemoryPro(state.student!.id, null);
    const link = slug();
    const { settings } = await (await save({ slug: link, published: true })).json();

    setMemoryPro(state.student!.id, false);
    expect((await findProofBySlug(link))?.settings.published).toBe(false);
    expect((await findProofByCredential(settings.credentialId))?.settings.published).toBe(false);
    // The student's own view shows it private, with everything they saved.
    const mine = await (await GET(req("/academy/api/proof"))).json();
    expect(mine.settings).toMatchObject({ slug: link, displayName: "Test Student", published: false });

    // Upgrading again brings it back without re-entering anything.
    setMemoryPro(state.student!.id, null);
    expect((await findProofBySlug(link))?.settings.published).toBe(true);
  });

  it("saves a lapsed portfolio as private instead of refusing the edit", async () => {
    setMemoryPro(state.student!.id, null);
    const link = slug();
    await save({ slug: link, published: true });
    setMemoryPro(state.student!.id, false);
    const res = await save({ slug: link, displayName: "New Name" });
    expect(res.status).toBe(200);
    expect((await res.json()).settings).toMatchObject({ displayName: "New Name", published: false });
  });
});
