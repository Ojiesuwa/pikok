import { getDate } from "../utils/getDate.js";

export const parseDevotionalLinksPage = (devotionalLinksPage) => {
  const currentDate = getDate();

  const decodeEntities = (str) =>
    str
      .replace(/&#8217;/g, "\u2019")
      .replace(/&#8216;/g, "\u2018")
      .replace(/&#8220;/g, "\u201C")
      .replace(/&#8221;/g, "\u201D")
      .replace(/&#8211;/g, "\u2013")
      .replace(/&#8212;/g, "\u2014")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/g, "&");

  const titleAnchorRegex =
    /<h3[^>]*class=['"][^'"]*post-title[^'"]*['"][^>]*>\s*<a[^>]+href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi;

  const openHeavenDateRegex =
    /^Open Heavens?\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/i;

  let match;
  try {
    while ((match = titleAnchorRegex.exec(devotionalLinksPage)) !== null) {
      const href = match[1];
      const title = decodeEntities(match[2])
        .replace(/<[^>]+>/g, "")
        .trim();

      const dateMatch = title.match(openHeavenDateRegex);
      if (!dateMatch) continue;

      const [, day, month, year] = dateMatch;

      const sameDay = Number(day) === Number(currentDate.date);
      const sameMonth =
        month.toLowerCase() === String(currentDate.month).toLowerCase();
      const sameYear = currentDate.year
        ? Number(year) === Number(currentDate.year)
        : true;

      if (sameDay && sameMonth && sameYear) {
        return href; // ✅ found it
      }
    }
  } catch (error) {
    // A genuine parsing failure (bad regex state, unexpected input type, etc.)
    console.error(error);
    throw new Error("Error Parsing Devotional Links Page");
  }

  // Loop completed with no match — today's post just isn't listed (yet).
  // This is NOT a parsing failure, so don't mask it as one.
  return null;
};
