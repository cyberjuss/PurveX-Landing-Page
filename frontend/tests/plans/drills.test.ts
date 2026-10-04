import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/academy/api/drill/route";
import { gradeDrill, startDrill, type DrillEntry } from "@/lib/academy-drills";
import { runCoachToolResult } from "@/lib/academy-coach";
import { createRealCtf } from "@/lib/academy-live";
import { FREE_DRILLS_PER_WEEK, PRO_ONLY, setMemoryPro } from "@/lib/academy-plan";
import { loadDrills, saveDrill } from "@/lib/academy-store";
import { entry, newStudent, req, today, type TestStudent } from "./helpers";

const state = vi.hoisted(() => ({ student: null as TestStudent | null }));

vi.mock("@/lib/supabase-admin", () => ({ supabaseAdmin: null }));
vi.mock("@/lib/academy-auth", () => ({ isAcademyUnlocked: async () => true }));
vi.mock("@/lib/academy-student", () => ({ getAcademyStudent: async () => state.student }));
// Starting and grading are stubbed; the test is about whether the route lets a drill start or count.
vi.mock("@/lib/academy-drills", async (original) => ({
  ...(await original<typeof import("@/lib/academy-drills")>()),
  startDrill: vi.fn(() => ({ token: "t", mode: "timed", items: [] })),
  gradeDrill: vi.fn(),
}));
vi.mock("@/lib/academy-live", async (original) => ({
  ...(await original<typeof import("@/lib/academy-live")>()),
  ctfStatus: vi.fn(async () => ({ state: "not_started", detail: "Not started yet.", hasLog: true })),
  createRealCtf: vi.fn(async () => null),
}));

const start = (mode = "timed") => POST(req("/academy/api/drill", { method: "POST", body: { action: "start", mode, day: today() } }));
const finish = () => POST(req("/academy/api/drill", { method: "POST", body: { action: "finish", token: "t", answers: [], day: today() } }));

/** Finished drills already in this week's log. Daily and CTF, so the 24-hour incident wait never applies. */
async function seed(n: number) {
  for (let i = 0; i < n; i++) await saveDrill(state.student!.id, entry(i % 2 ? "ctf" : "daily"));
}

function graded(e: DrillEntry) {
  vi.mocked(gradeDrill).mockResolvedValue({ entry: e, review: [], late: false } as unknown as Awaited<ReturnType<typeof gradeDrill>>);
}

describe("Drills by plan", () => {
  beforeEach(() => {
    state.student = newStudent();
    vi.mocked(startDrill).mockClear();
    vi.mocked(createRealCtf).mockClear();
  });

  it(`lets Free start drills until ${FREE_DRILLS_PER_WEEK} are done this week`, async () => {
    await seed(FREE_DRILLS_PER_WEEK - 1);
    expect((await start()).status).toBe(200);
    await seed(1);
    const res = await start();
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe(PRO_ONLY.drills);
    expect(startDrill).toHaveBeenCalledTimes(1);
  });

  it("does not record a drill Free started before reaching the limit", async () => {
    await seed(FREE_DRILLS_PER_WEEK);
    graded(entry("timed"));
    const res = await finish();
    expect(res.status).toBe(403);
    expect(await loadDrills(state.student!.id)).toHaveLength(FREE_DRILLS_PER_WEEK);
  });

  it("records a drill Free finishes within the limit", async () => {
    await seed(FREE_DRILLS_PER_WEEK - 1);
    graded(entry("timed"));
    expect((await finish()).status).toBe(200);
    expect(await loadDrills(state.student!.id)).toHaveLength(FREE_DRILLS_PER_WEEK);
  });

  it("never limits Pro", async () => {
    setMemoryPro(state.student!.id, null);
    await seed(FREE_DRILLS_PER_WEEK + 3);
    expect((await start()).status).toBe(200);
    graded(entry("timed"));
    expect((await finish()).status).toBe(200);
    expect(await loadDrills(state.student!.id)).toHaveLength(FREE_DRILLS_PER_WEEK + 4);
  });
});

describe("The weekly CTF through Coach or an MCP client", () => {
  const ctx = () => ({ results: {}, loadLabState: async () => null, userId: state.student!.id });

  beforeEach(() => {
    state.student = newStudent();
    vi.mocked(createRealCtf).mockClear();
  });

  it("will not open on Free once the week's drills are used", async () => {
    await seed(FREE_DRILLS_PER_WEEK);
    const res = await runCoachToolResult("start_investigation", {}, ctx());
    expect(res.isError).toBe(true);
    expect(JSON.parse(res.text).error).toBe(PRO_ONLY.drills);
    expect(createRealCtf).not.toHaveBeenCalled();
  });

  it("opens on Free within the limit, and always on Pro", async () => {
    await seed(FREE_DRILLS_PER_WEEK - 1);
    await runCoachToolResult("start_investigation", {}, ctx());
    expect(createRealCtf).toHaveBeenCalledTimes(1);

    state.student = newStudent();
    setMemoryPro(state.student.id, null);
    await seed(FREE_DRILLS_PER_WEEK + 2);
    await runCoachToolResult("start_investigation", {}, ctx());
    expect(createRealCtf).toHaveBeenCalledTimes(2);
  });
});
