"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Circle, HelpCircle, Loader2, Square } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { CLIP_AUDIO_BPS, CLIP_MAX_BYTES, CLIP_MAX_SECONDS, CLIP_VIDEO_BPS } from "@/lib/academy-clip-limits";

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pickMimeType() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return candidates.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

// getDisplayMedia asks the student to share a tab, window or screen,
// MediaRecorder captures it, and on stop the file downloads straight to
// disk. Nothing leaves the browser unless the student then chooses "Add to
// my profile": the server checks the challenge is fully solved, hands back a
// signed upload link, and the clip goes on their Proof Profile with a
// Verified solve stamp.
type Take = { blob: Blob; seconds: number; recordedAt: string };
type ClipState = { kind: "idle" } | { kind: "busy" } | { kind: "done" } | { kind: "error"; text: string; upgrade?: boolean };

export function ChallengeRecorder({ label, challenge = null }: { label: string; challenge?: string | null }) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [take, setTake] = useState<Take | null>(null);
  const [clip, setClip] = useState<ClipState>({ kind: "idle" });
  const startedAtRef = useRef<{ iso: string; ms: number } | null>(null);
  // A muted copy of the capture, read once at the end for the profile's still frame.
  const frameRef = useRef<HTMLVideoElement | null>(null);
  const posterRef = useRef<Blob | null>(null);
  const helpId = useId();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Checked after mount only, so the server and the first client render
  // agree (no navigator/MediaRecorder on the server) and React never flags
  // a hydration mismatch over a button that only some browsers can show.
  useEffect(() => {
    setSupported(
      typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getDisplayMedia) &&
        typeof MediaRecorder !== "undefined"
    );
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const teardown = useCallback(() => {
    stopTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    if (frameRef.current) frameRef.current.srcObject = null;
    frameRef.current = null;
    setRecording(false);
    setSeconds(0);
  }, [stopTimer]);

  const download = useCallback(() => {
    const parts = chunksRef.current;
    chunksRef.current = [];
    if (!parts.length) return;
    const blob = new Blob(parts, { type: parts[0].type || "video/webm" });
    const began = startedAtRef.current;
    if (began) {
      setTake({ blob, seconds: Math.round((Date.now() - began.ms) / 1000), recordedAt: began.iso });
      setClip({ kind: "idle" });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purvex-${slugify(label)}-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, [label]);

  /** Saves what the screen shows right now as a JPEG, for the clip's still frame. Skipped quietly if the browser can't. */
  const grabFrame = useCallback(() => {
    const v = frameRef.current;
    if (!v || !v.videoWidth) return;
    const scale = Math.min(1, 1280 / v.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    try {
      canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (b) posterRef.current = b;
      }, "image/jpeg", 0.8);
    } catch {
      // A still frame is a nice-to-have. The clip works without one.
    }
  }, []);

  const stop = useCallback(() => {
    grabFrame();
    recorderRef.current?.stop();
  }, [grabFrame]);

  const start = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch {
      // Permission dialog dismissed or blocked. Nothing to recover from --
      // just stay idle rather than showing an alarming error.
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    posterRef.current = null;
    const frame = document.createElement("video");
    frame.muted = true;
    frame.playsInline = true;
    frame.srcObject = stream;
    frame.play().catch(() => {});
    frameRef.current = frame;
    const mimeType = pickMimeType();
    // A modest bitrate keeps screen text readable and a 15-minute clip under the profile's size cap.
    const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: CLIP_VIDEO_BPS, audioBitsPerSecond: CLIP_AUDIO_BPS });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      download();
      teardown();
    };
    // Covers stopping from the browser's own "Stop sharing" bar, not just our button.
    stream.getVideoTracks()[0]?.addEventListener("ended", stop);
    recorder.start();
    startedAtRef.current = { iso: new Date().toISOString(), ms: Date.now() };
    setTake(null);
    setClip({ kind: "idle" });
    recorderRef.current = recorder;
    setRecording(true);
    setSeconds(0);
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
  }, [download, teardown, stop]);

  // Belt-and-suspenders: release the capture if this challenge unmounts
  // (switching pills) while a recording is still running.
  useEffect(() => () => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    stopTimer();
  }, [stopTimer]);

  const addToProfile = useCallback(async () => {
    if (!take || !challenge) return;
    setClip({ kind: "busy" });
    const fail = (text: string, upgrade = false) => setClip({ kind: "error", text, upgrade });
    try {
      const res = await academyFetch("/academy/api/proof/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, sizeBytes: take.blob.size, durationSec: take.seconds, recordedAt: take.recordedAt }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; uploadUrl?: string; posterUploadUrl?: string | null; error?: string; upgrade?: string };
      if (!res.ok || !body.id || !body.uploadUrl) return fail(body.error ?? "Couldn't add the clip. Try again.", res.status === 403);
      const put = await fetch(body.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "video/webm", "x-upsert": "false" },
        body: take.blob,
      });
      if (!put.ok) return fail("The upload didn't finish. Check your connection and try again.");
      if (body.posterUploadUrl && posterRef.current) {
        await fetch(body.posterUploadUrl, { method: "PUT", headers: { "Content-Type": "image/jpeg", "x-upsert": "false" }, body: posterRef.current }).catch(() => null);
      }
      const done = await academyFetch(`/academy/api/proof/clip?id=${encodeURIComponent(body.id)}`, { method: "PATCH" });
      if (!done.ok) {
        const b = (await done.json().catch(() => ({}))) as { error?: string };
        return fail(b.error ?? "Couldn't add the clip. Try again.");
      }
      setClip({ kind: "done" });
    } catch {
      fail("Couldn't add the clip. Try again.");
    }
  }, [take, challenge]);

  if (!supported) return null;

  const tooBig = take ? take.blob.size > CLIP_MAX_BYTES || take.seconds > CLIP_MAX_SECONDS : false;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <div className="ad-record">
        {recording ? (
          <button type="button" className="ad-record__btn ad-record__btn--on" onClick={stop}>
            <Square className="h-3.5 w-3.5" aria-hidden /> Stop recording · {mm}:{ss}
          </button>
        ) : (
          <button type="button" className="ad-record__btn" onClick={start}>
            <Circle className="h-3.5 w-3.5" aria-hidden /> Record your challenge
          </button>
        )}
        <button
          type="button"
          className="ad-record__help"
          aria-expanded={helpOpen}
          aria-controls={helpId}
          onClick={() => setHelpOpen((o) => !o)}
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden /> How to record
        </button>
      </div>
      {take && challenge && !recording ? (
        <div className="ad-record__clip" role="status">
          {clip.kind === "done" ? (
            <span className="ad-record__clip-ok">
              <BadgeCheck className="h-4 w-4" aria-hidden /> Added to your profile. <Link href="/range/portfolio">View portfolio</Link>
            </span>
          ) : tooBig ? (
            <span>This recording is over 15 minutes, so it can&apos;t go on your profile. It&apos;s still saved in Downloads.</span>
          ) : (
            <>
              <button type="button" className="ad-record__add" onClick={addToProfile} disabled={clip.kind === "busy"}>
                {clip.kind === "busy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <BadgeCheck className="h-3.5 w-3.5" aria-hidden />}
                {clip.kind === "busy" ? "Adding…" : "Add to my profile"}
              </button>
              {clip.kind === "error" ? (
                <span className="ad-record__clip-bad">
                  {clip.text} {clip.upgrade ? <Link href="/range/upgrade">Upgrade</Link> : null}
                </span>
              ) : (
                <span>Saved to Downloads. Add it to your portfolio as a verified solve.</span>
              )}
            </>
          )}
        </div>
      ) : null}
      {helpOpen ? (
        <div id={helpId} className="ad-record__guide" role="region" aria-label="How to record a challenge">
          <p className="ad-record__guide-title">How to record a challenge</p>
          <ol>
            <li>Click <strong>Record your challenge</strong> and choose your screen or window.</li>
            <li>Work the challenge as usual.</li>
            <li>
              Click <strong>Stop recording</strong>. The video saves to your Downloads folder.
            </li>
            <li>
              Once the challenge is solved, click <strong>Add to my profile</strong> to show it on your portfolio as a verified solve.
            </li>
          </ol>
          <p className="ad-record__guide-note">Nothing is uploaded unless you add it to your profile.</p>
        </div>
      ) : null}
    </>
  );
}
