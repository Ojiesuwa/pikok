import { retry } from "./retry.js";

// Strips trailing KJV marginal notes that this dataset glues onto
// the end of some verses with no separator, in the form:
//   "...actual verse text.{chapter}.{verse} note text"
// e.g. "...verily thou shalt be fed.37.3 verily: Heb. in truth, or, stableness"
//                                    ^^^^ this and everything after it is noise
function stripFootnote(text, chapter, verse) {
  const marker = new RegExp(`${chapter}\\.${verse}\\b`);
  const match = text.match(marker);
  return match ? text.slice(0, match.index).trim() : text.trim();
}

// Confirmed against the actual repo directory listing:
// book slugs are just the name lowercased with all spaces removed
// (e.g. "1 Samuel" -> "1samuel", "Song of Solomon" -> "songofsolomon").
// One real exception: this dataset only has "psalms" (plural), never
// "psalm" singular, so that needs an explicit mapping.
function toBookSlug(book) {
  const normalized = book
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (normalized === "psalm") return "psalms";
  return normalized;
}

// Old callers may still pass a bare translation code like "kjv".
// This API wants a full version id like "en-kjv" (language prefix + version).
function toVersionId(translation) {
  return translation.includes("-") ? translation : `en-${translation}`;
}

async function fetchVerse(reference, translation = "kjv") {
  const match = reference.trim().match(/^(.+?)\s+(\d+)\s*:\s*(\d+)$/);
  if (!match) {
    throw new Error(`Invalid Bible verse reference: "${reference}"`);
  }
  const [, book, chapter, verse] = match;

  const version = toVersionId(translation);
  const bookSlug = toBookSlug(book);
  const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${bookSlug}/chapters/${chapter}/verses/${verse}.json`;

  const res = await retry(() => fetch(url), { retries: 50, baseDelay: 300 });

  if (!res.ok) {
    const body = await res.text().catch(() => "<unreadable body>");
    throw new Error(`Failed to fetch "${reference}" (${res.status}): ${body}`);
  }

  const data = await res.json();

  return stripFootnote(data.text, chapter, verse);
}

// Fetch multiple individual Bible references
//
// Example:
// fetchVerses(["John 3:1", "Psalm 23:1"])
//
// Returns:
// [
//   "In the beginning...",
//   "The Lord is my shepherd..."
// ]

export async function fetchVerses(references, translation = "kjv") {
  return Promise.all(references.map((ref) => fetchVerse(ref, translation)));
}

// Fetch a single verse OR a verse range
//
// Examples:
//
// fetchVerseRange("John 3:1")
//
// Returns:
// [
//   "John 3:1 - In the beginning..."
// ]
//
//
// fetchVerseRange("John 3:1-3")
//
// Returns:
// [
//   "John 3:1 - In the beginning...",
//   "John 3:2 - ...",
//   "John 3:3 - ..."
// ]

export async function fetchVerseRange(reference, translation = "kjv") {
  const cleaned = reference.trim().replace(/\s+/g, " ");

  /*
    Supports:

    John 3:1
    John 3:1-3

    John 3: 1
    John 3: 1 - 3

    1 Samuel 16:11-13
    2 Corinthians 5:17-19
  */

  const match = cleaned.match(/^(.+?)\s+(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$/);

  if (!match) {
    throw new Error(`Invalid Bible verse reference: "${reference}"`);
  }

  const [, book, chapter, startVerse, endVerse] = match;

  const start = Number(startVerse);
  const end = endVerse ? Number(endVerse) : start;

  if (end < start) {
    throw new Error(
      `Invalid verse range: "${reference}". End verse cannot be smaller than start verse.`,
    );
  }

  const references = Array.from(
    { length: end - start + 1 },
    (_, index) => `${book} ${chapter}:${start + index}`,
  );

  const verses = await fetchVerses(references, translation);

  return verses.map((verse, index) => `${references[index]} - ${verse}`);
}
