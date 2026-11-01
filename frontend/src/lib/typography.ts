// Typographer's quotes for display text. The display face draws a straight
// " as a closing quote, so "secure" set large read as ”secure”. Opening and
// closing marks are told apart by what comes before them, and an apostrophe
// inside a word becomes a right single quote. Only for headings and other
// large text, never code.

export function curlyQuotes(text: string): string {
  return text
    .replace(/(^|[\s([{—-])"/g, "$1“")
    .replace(/"/g, "”")
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/(^|[\s([{—-])'/g, "$1‘")
    .replace(/'/g, "’");
}
