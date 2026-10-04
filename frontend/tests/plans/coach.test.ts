import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/academy/api/coach/route";
import { runCoachTurn } from "@/lib/academy-coach";
import { createClass, joinClass } from "@/lib/academy-classes";
import { FREE_COACH_DAILY, PRO_ONLY, setMemoryPro } from "@/lib/academy-plan";
import { newStudent, req, today, type TestStudent } from "./helpers";

const state = vi.hoisted(() => ({ student: null as TestStudent | null }));

vi.mock("@/lib/supabase-admin", () => ({ supabaseAdmin: null }));
vi.mock("@/lib/academy-auth", () => ({ isAcademyUnlocked: async () => true }));
vi.mock("@/lib/academy-student", () => ({ getAcademyStudent: async () => state.student }));
vi.mock("@/lib/academy-coach", async (original) => ({
  ...(await original<typeof import("@/lib/academy-coach")>()),
  runCoachTurn: vi.fn(async () => ({ text: "ok", model: "test" })),
}));

const ask = (body: Record<string, unknown> = {}) => POST(req("/academy/api/coach", { method: "POST", body: { message: "Why did the login fail?", day: today(), ...body } }));
const allowance = async () => (await GET(req(`/academy/api/coach?day=${today()}`))).json();

describe("Coach by plan", () => {
  beforeEach(() => {
    state.student = newStudent();
    vi.mocked(runCoachTurn).mockClear();
  });

  it(`gives Free ${FREE_COACH_DAILY} chats a day, then stops`, async () => {
    expect(await allowance()).toMatchObject({ plan: "free", limit: FREE_COACH_DAILY, remaining: FREE_COACH_DAILY });
    for (let i = 0; i < FREE_COACH_DAILY; i++) expect((await ask()).status).toBe(200);
    const over = await ask();
    expect(over.status).toBe(429);
    expect(runCoachTurn).toHaveBeenCalledTimes(FREE_COACH_DAILY);
  });

  it("keeps mock interviews and resume help off Free", async () => {
    const res = await ask({ mode: "interview" });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe(PRO_ONLY.interview);
    expect(runCoachTurn).not.toHaveBeenCalled();
  });

  it("keeps screenshots off Free", async () => {
    const res = await ask({ images: [{ type: "image/png", data: "x" }] });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe(PRO_ONLY.screenshots);
    expect(runCoachTurn).not.toHaveBeenCalled();
  });

  it("gives Pro the full limit and interviews", async () => {
    setMemoryPro(state.student!.id, null);
    expect(await allowance()).toMatchObject({ plan: "pro", limit: 20 });
    expect((await ask({ mode: "interview" })).status).toBe(200);
    for (let i = 0; i < FREE_COACH_DAILY + 2; i++) expect((await ask()).status).toBe(200);
  });

  it("gives a class seat the same as Pro", async () => {
    const cls = await createClass("Spring Cohort", "teacher@example.com");
    await joinClass(cls!.id, state.student!);
    expect(await allowance()).toMatchObject({ plan: "class", limit: 20 });
    expect((await ask({ mode: "interview" })).status).toBe(200);
  });

  it("takes interviews away again when Pro ends", async () => {
    setMemoryPro(state.student!.id, new Date(Date.now() - 1000).toISOString());
    expect((await ask({ mode: "interview" })).status).toBe(403);
    expect(await allowance()).toMatchObject({ plan: "free", limit: FREE_COACH_DAILY });
  });
});
