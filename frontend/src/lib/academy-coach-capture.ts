import { COACH_IMAGE_MAX, type CoachImage } from "@/lib/academy-coach-media";

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.84;
const MAX_BYTES = 1_400_000;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const comma = text.indexOf(",");
      resolve(comma >= 0 ? text.slice(comma + 1) : text);
    };
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(blob);
  });
}

async function canvasToImage(canvas: HTMLCanvasElement): Promise<CoachImage> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not read that image."))), "image/jpeg", JPEG_QUALITY);
  });
  if (blob.size > MAX_BYTES) throw new Error("That image is too large. Crop it and try again.");
  return { mediaType: "image/jpeg", data: await blobToBase64(blob) };
}

function drawToCanvas(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function asImageFile(file: File): File {
  if (file.type.startsWith("image/")) return file;
  return new File([file], file.name || "screenshot.png", { type: "image/png" });
}

export async function fileToCoachImage(file: File): Promise<CoachImage> {
  const bitmap = await createImageBitmap(asImageFile(file));
  try {
    return await canvasToImage(drawToCanvas(bitmap, bitmap.width, bitmap.height));
  } finally {
    bitmap.close();
  }
}

export async function filesToCoachImages(files: Iterable<File>, already = 0): Promise<CoachImage[]> {
  const room = Math.max(0, COACH_IMAGE_MAX - already);
  if (room === 0) throw new Error("Two screenshots max.");
  const picked: File[] = [];
  for (const file of files) {
    if (file.type.startsWith("image/") || !file.type) picked.push(asImageFile(file));
    if (picked.length >= room) break;
  }
  if (!picked.length) throw new Error("Could not read that screenshot. Paste or upload a PNG or JPG.");
  return Promise.all(picked.map(fileToCoachImage));
}

export async function captureCoachScreenshot(): Promise<CoachImage> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("This browser cannot capture the screen. Upload or paste instead.");
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { width: 1920, height: 1080, frameRate: 5 },
    audio: false,
  });
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        video.onloadeddata = done;
        window.setTimeout(done, 700);
      });
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) throw new Error("Could not capture that screen.");
    return await canvasToImage(drawToCanvas(video, width, height));
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function imagesFromClipboard(bag: DataTransfer | null): File[] {
  if (!bag) return [];
  const fromFiles = [...bag.files]
    .filter((file) => file.type.startsWith("image/") || !file.type)
    .map(asImageFile);
  if (fromFiles.length) return fromFiles;
  return [...bag.items]
    .filter((item) => item.type.startsWith("image/") || item.type === "")
    .map((item) => item.getAsFile())
    .filter((file): file is File => !!file)
    .map(asImageFile);
}
