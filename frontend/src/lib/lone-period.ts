// A tile, a card face, a step or a prompt is a label, not a paragraph, so a
// lone sentence on one does not need its closing full stop. Text with more
// than one sentence keeps all of its punctuation, as do ellipses and
// abbreviations at the end. Works on plain text and on inline HTML (the stop
// may sit just before closing tags such as </strong>).

const INNER_STOP = /[.!?]["')\]]*\s+\S/;

export function dropLonePeriod(text: string): string {
  const plain = text.replace(/<[^>]+>/g, "").trim();
  if (!plain.endsWith(".") || plain.endsWith("..") || /\b(e\.g|i\.e|etc|vs)\.$/i.test(plain)) return text;
  if (INNER_STOP.test(plain.slice(0, -1))) return text;
  return text.replace(/\.((?:\s*<\/[a-z]+>)*\s*)$/i, "$1");
}
