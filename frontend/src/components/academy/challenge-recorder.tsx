"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Circle, HelpCircle, Square } from "lucide-react";

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function pickMimeType() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return candidates.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
}

// Local-only: the recording never leaves the browser. getDisplayMedia asks
// the student to share a tab/window/screen, MediaRecorder captures it, and
// on stop the blob downloads straight to disk. No upload, no server, no
// backend -- the whole point is a portfolio clip they already own.
export function ChallengeRecorder({ label }: { label: string }) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
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
    setRecording(false);
    setSeconds(0);
  }, [stopTimer]);

  const download = useCallback(() => {
    const parts = chunksRef.current;
    chunksRef.current = [];
    if (!parts.length) return;
    const blob = new Blob(parts, { type: parts[0].type || "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purvex-${slugify(label)}-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, [label]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

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
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
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

  if (!supported) return null;

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
      {helpOpen ? (
        <div id={helpId} className="ad-record__guide" role="region" aria-label="How to record a challenge">
          <p className="ad-record__guide-title">How to record a challenge</p>
          <ol>
            <li>
              Before you start, close anything you don&apos;t want on camera, such as email or chat. Then click{" "}
              <strong>Record your challenge</strong>, and your browser will ask what you&apos;d like to share.
            </li>
            <li>
              Choose what to capture. Pick <strong>Entire screen</strong> if you&apos;ll move between this page and your
              lab, or a single window if all the work happens in one place. If your browser offers{" "}
              <strong>Share audio</strong>, tick it to include sound from the screen. Your microphone isn&apos;t recorded.
            </li>
            <li>Work the challenge as usual. The red button counts how long you&apos;ve been recording.</li>
            <li>
              When you&apos;re finished, click <strong>Stop recording</strong>, or <strong>Stop sharing</strong> in your
              browser&apos;s bar. The video saves to your Downloads folder as{" "}
              <code>purvex-{slugify(label)}-date.webm</code>.
            </li>
          </ol>
          <p className="ad-record__guide-note">
            The recording stays on your computer, and nothing is uploaded to PurveX. If you switch to a different
            challenge while recording, it stops and saves what you have so far. Before you share the video, watch it
            through once for passwords or anything private on screen. Most video sites accept .webm files, and for one
            that doesn&apos;t, convert the file to .mp4 first.
          </p>
        </div>
      ) : null}
    </>
  );
}
