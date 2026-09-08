export const getVerseFromMv = (mv) => {
  if (!mv) return null;

  const [, refPart] = mv.includes("–") ? mv.split("–") : [null, mv];
  if (refPart == null) return null;

  return refPart.replace(/\s*\([^)]*\)\s*$/, "").trim();
};
