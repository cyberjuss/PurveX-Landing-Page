import { afterEach, describe, expect, it, vi } from "vitest";
import { createClass, joinClass } from "@/lib/academy-classes";
import { canDrill, coachAllowance, drillsThisWeek, FREE_COACH_DAILY, FREE_DRILLS_PER_WEEK, planFor, setMemoryPro } from "@/lib/academy-plan";
import { entry, newStudent } from "./helpers";

vi.mock("@/lib/supabase-admin", () => ({ supabaseAdmin: null }));

const days = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

describe("planFor", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("gives everyone the full course until plans are switched on", async () => {
    vi.stubEnv("ACADEMY_PLANS", "");
    expect(await planFor(newStudent().id, null)).toBe("pro");
  });

  it("puts a new student on Free", async () => {
    const s = newStudent();
    expect(await planFor(s.id, s.email)).toBe("free");
  });

  it("gives Pro while it is active, and Free once it runs out", async () => {
    const open = newStudent();
    const running = newStudent();
    const lapsed = newStudent();
    setMemoryPro(open.id, null);
    setMemoryPro(running.id, days(10));
    setMemoryPro(lapsed.id, days(-1));
    expect(await planFor(open.id, open.email)).toBe("pro");
    expect(await planFor(running.id, running.email)).toBe("pro");
    expect(await planFor(lapsed.id, lapsed.email)).toBe("free");
  });

  it("drops back to Free when Pro is removed", async () => {
    const s = newStudent();
    setMemoryPro(s.id, null);
    setMemoryPro(s.id, false);
    expect(await planFor(s.id, s.email)).toBe("free");
  });

  it("gives class students, instructors and admins the class plan", async () => {
    const instructor = newStudent();
    const member = newStudent();
    const cls = await createClass("Fall Cohort", instructor.email!);
    await joinClass(cls!.id, member);
    expect(await planFor(member.id, member.email)).toBe("class");
    expect(await planFor(instructor.id, instructor.email)).toBe("class");
    expect(await planFor(newStudent().id, "admin@example.com")).toBe("class");
  });
});

describe("coachAllowance", () => {
  it("caps Free at the free limit and ignores drill bonus chats", () => {
    expect(coachAllowance("free", 20, 5)).toEqual({ limit: FREE_COACH_DAILY, bonus: 0 });
  });

  it("gives paid plans the full limit plus earned chats", () => {
    expect(coachAllowance("pro", 20, 3)).toEqual({ limit: 23, bonus: 3 });
    expect(coachAllowance("class", 20, 0)).toEqual({ limit: 20, bonus: 0 });
  });
});

describe("weekly drills", () => {
  // Wednesday; the week starts Monday 2026-10-05.
  const day = "2026-10-07";

  it("counts this week's drills only, and not practice logged by Coach", () => {
    const entries = [entry("daily", "2026-10-05"), entry("timed", day), entry("ctf", day), entry("coach", day), entry("daily", "2026-10-04")];
    expect(drillsThisWeek(entries, day)).toBe(3);
  });

  it(`stops Free at ${FREE_DRILLS_PER_WEEK} a week and never stops paid plans`, () => {
    const two = [entry("daily", day), entry("timed", day)];
    const three = [...two, entry("ctf", day)];
    expect(canDrill("free", two, day)).toBe(true);
    expect(canDrill("free", three, day)).toBe(false);
    expect(canDrill("pro", [...three, ...three], day)).toBe(true);
    expect(canDrill("class", [...three, ...three], day)).toBe(true);
  });
});
