import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/academy/api/hosted-lab/route";
import { hostedLabLink, startHostedLab, stopHostedLab } from "@/lib/academy-hosted";
import { createClass, joinClass } from "@/lib/academy-classes";
import { PRO_ONLY, setMemoryPro } from "@/lib/academy-plan";
import { newStudent, req, type TestStudent } from "./helpers";

const state = vi.hoisted(() => ({ student: null as TestStudent | null, listed: true }));

vi.mock("@/lib/supabase-admin", () => ({ supabaseAdmin: null }));
vi.mock("@/lib/academy-auth", () => ({ isAcademyUnlocked: async () => true }));
vi.mock("@/lib/academy-student", () => ({ getAcademyStudent: async () => state.student }));
// AWS is never called: every lab action is a stub, so the test only sees whether the route let it through.
vi.mock("@/lib/academy-hosted", () => ({
  canUseHostedLab: () => state.listed,
  hostedLabStatus: vi.fn(async () => ({ state: "ready", stopAt: null, startedAt: null, firstBoot: false, instanceType: "t3.medium" })),
  startHostedLab: vi.fn(async () => undefined),
  stopHostedLab: vi.fn(async () => undefined),
  extendHostedLab: vi.fn(async () => undefined),
  resetHostedLab: vi.fn(async () => undefined),
  hostedLabLink: vi.fn(async () => "https://lab.example.com/session"),
  stopDueHostedLabs: vi.fn(async () => 0),
}));
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after: () => undefined }));

const act = (action: string) => POST(req("/academy/api/hosted-lab", { method: "POST", body: { action } }));

describe("Hosted lab by plan", () => {
  beforeEach(() => {
    state.student = newStudent();
    state.listed = true;
    vi.mocked(startHostedLab).mockClear();
    vi.mocked(hostedLabLink).mockClear();
  });

  it("hides the lab from Free and refuses every action but stop", async () => {
    expect(await (await GET(req("/academy/api/hosted-lab"))).json()).toEqual({ available: false });
    for (const action of ["start", "open", "extend", "reset"]) {
      const res = await act(action);
      expect(res.status).toBe(403);
      expect((await res.json()).error).toBe(PRO_ONLY.hostedLab);
    }
    expect(startHostedLab).not.toHaveBeenCalled();
    expect(hostedLabLink).not.toHaveBeenCalled();
  });

  it("lets Pro start and open the lab", async () => {
    setMemoryPro(state.student!.id, null);
    expect(await (await GET(req("/academy/api/hosted-lab"))).json()).toMatchObject({ available: true });
    expect((await act("start")).status).toBe(200);
    expect(startHostedLab).toHaveBeenCalledWith(state.student!.id);
    expect(await (await act("open")).json()).toEqual({ url: "https://lab.example.com/session" });
  });

  it("lets a class seat start the lab", async () => {
    const cls = await createClass("Lab Cohort", "teacher@example.com");
    await joinClass(cls!.id, state.student!);
    expect((await act("start")).status).toBe(200);
  });

  it("still needs the account on the hosted lab list, even on Pro", async () => {
    setMemoryPro(state.student!.id, null);
    state.listed = false;
    expect((await act("start")).status).toBe(403);
    expect(startHostedLab).not.toHaveBeenCalled();
  });

  it("locks the lab again when Pro ends, but still lets the student stop it", async () => {
    setMemoryPro(state.student!.id, new Date(Date.now() - 1000).toISOString());
    expect((await act("open")).status).toBe(403);
    expect(hostedLabLink).not.toHaveBeenCalled();
    expect((await act("stop")).status).toBe(200);
    expect(stopHostedLab).toHaveBeenCalledWith(state.student!.id);
  });
});
