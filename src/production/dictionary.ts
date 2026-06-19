// Custom spelling dictionary: a user-maintained word list layered on top of the
// webview's native spellcheck. Words are stored case-insensitively but preserve
// the first-seen casing for display.

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

export function addWord(list: string[], word: string): string[] {
  const w = word.trim();
  if (!w) return list;
  if (list.some((x) => normalizeWord(x) === normalizeWord(w))) return list;
  return [...list, w].sort((a, b) => a.localeCompare(b));
}

export function removeWord(list: string[], word: string): string[] {
  return list.filter((x) => normalizeWord(x) !== normalizeWord(word));
}

export function isKnown(list: string[], word: string): boolean {
  return list.some((x) => normalizeWord(x) === normalizeWord(word));
}

/** Words in `text` not present in the dictionary (unique, original casing). */
export function unknownWords(list: string[], text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[^A-Za-z']+/)) {
    if (!raw) continue;
    const key = normalizeWord(raw);
    if (!seen.has(key) && !isKnown(list, raw)) {
      seen.add(key);
      out.push(raw);
    }
  }
  return out;
}
