export function findMatches(text: string, query: string): number[] {
  if (!query) return [];
  const out: number[] = [];
  const hay = text.toLowerCase();
  const needle = query.toLowerCase();
  let i = hay.indexOf(needle);
  while (i !== -1) {
    out.push(i);
    i = hay.indexOf(needle, i + needle.length);
  }
  return out;
}

export function replaceAll(text: string, query: string, replacement: string): string {
  if (!query) return text;
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return text.replace(re, replacement);
}
