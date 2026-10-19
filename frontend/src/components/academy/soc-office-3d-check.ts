/** Whether this device can draw WebGL at all. Kept apart from the 3D office so checking does not load it. */
export function canWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
