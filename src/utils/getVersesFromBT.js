export const getVersesFromBT = (bibleText) => {
  if (!bibleText) return [];

  const lines = bibleText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const [header, ...verseLines] = lines;

  // e.g. "1 Samuel 2:7-9 (KJV)" -> book="1 Samuel", chapter="2"
  const headerMatch = header.match(/^(.+?)\s+(\d+):\d+(?:-\d+)?/);
  if (!headerMatch) return [];
  const [, book, chapter] = headerMatch;

  return verseLines
    .map((line) => line.match(/^(\d+)\b/)) // leading verse number on each line
    .filter(Boolean)
    .map((m) => `${book} ${chapter}:${m[1]}`);
};
