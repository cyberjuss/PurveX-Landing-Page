import { Video } from "lucide-react";

// A placeholder for a short video of Justin introducing the week's topic.
// One per week page (phase-entry.tsx renders it once, above the tabs), not
// one per lesson -- a student should see a face once per topic, not five
// times walking through the same week. Swap for a real embed once a video
// exists; nothing else about the page needs to change.
export function TopicVideo() {
  return (
    <div className="ax-video">
      <span className="ax-video__icon" aria-hidden>
        <Video className="h-4 w-4" />
      </span>
      <div>
        <p className="ax-video__title">A word from Justin</p>
        <p className="ax-video__note">Video coming soon.</p>
      </div>
    </div>
  );
}
