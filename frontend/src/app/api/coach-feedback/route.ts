import { NextResponse } from "next/server";
import { FEEDBACK_TAGS, listFeedback, type FeedbackTag } from "@/lib/academy-coach-feedback";

export const runtime = "nodejs";
export const maxDuration = 60;

// Rated Coach replies, for the owner. This is the half that turns a thumbs
// down into something you can act on: the rating alone says a reply was bad,
// the exchange next to it says what was bad about it.
//
// Behind CRON_SECRET, the same bearer the cron routes use. There is no student
// view of this: one person's rating is another person's unredacted transcript.
//
//   /api/coach-feedback                     every rating, newest first
//   /api/coach-feedback?rating=down         just the misses
//   /api/coach-feedback?format=eval         JSONL, one case per line
//
// The eval format is deliberately boring: prompt, what Coach said, and what
// the student said was wrong with it. That is the input an eval needs, and it
// is what you have as soon as students start rating.

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rating = url.searchParams.get("rating");
  const limit = Number(url.searchParams.get("limit") ?? 100);
  const rows = await listFeedback({
    rating: rating === "up" || rating === "down" ? rating : undefined,
    limit: Number.isFinite(limit) ? limit : 100,
  });

  if (url.searchParams.get("format") === "eval") {
    const lines = rows.map((r) =>
      JSON.stringify({
        id: r.turnId,
        rating: r.rating,
        question: r.question,
        reply: r.reply,
        // The instruction the reply broke, in the words the model is given.
        failed: r.tags.map((t: FeedbackTag) => FEEDBACK_TAGS[t].fix),
        reasons: r.tags,
        note: r.note,
        model: r.model,
        mode: r.mode,
        lab: r.lab,
        at: r.at,
      })
    );
    return new NextResponse(lines.join("\n"), {
      headers: { "content-type": "application/x-ndjson; charset=utf-8" },
    });
  }

  // A tally first, so "is it getting better" is answerable at a glance.
  const down = rows.filter((r) => r.rating === "down");
  const byReason: Record<string, number> = {};
  for (const r of down) for (const t of r.tags) byReason[t] = (byReason[t] ?? 0) + 1;

  return NextResponse.json({
    total: rows.length,
    up: rows.length - down.length,
    down: down.length,
    byReason,
    rows,
  });
}
