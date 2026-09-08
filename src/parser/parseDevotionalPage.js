/**
 * Extracts an Open Heavens devotional from the blog's raw HTML string.
 *
 * Works purely with string/regex parsing (no DOM needed), so it runs
 * in the browser or in Node.
 *
 * Usage:
 *   const devotional = parseOpenHeavensDevotional(htmlString);
 *
 * Returns:
 *   {
 *     topic: string,
 *     memory: string,
 *     bibleText: string,
 *     devotional: string,
 *     conclusion: { type: "prayerPoint" | "keyPoint" | "actionPoint" | "reflection", data: string }
 *   }
 */
export const parseDevotionalPage = (html) => {
  // ---- helpers -------------------------------------------------------

  // Known "noise" fragments the site injects with no surrounding
  // whitespace (hidden interlinking text). Stripped best-effort.
  const NOISE_PHRASES = [
    "Devotional book series",
    "Discover Faith Communities",
  ];

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

  const stripNoise = (str) => {
    let out = str;
    NOISE_PHRASES.forEach((phrase) => {
      out = out.split(phrase).join("");
    });
    return out;
  };

  const cleanBlock = (str) =>
    stripNoise(str)
      // drop "Also Read: ..." interlink lines
      .replace(/^\s*Also Read:.*$/gim, "")
      // collapse extra blank lines left behind
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n")
      .trim();

  // ---- 1. isolate the post body --------------------------------------

  const bodyMatch = html.match(
    /<div class=['"]post-body[^'"]*['"][^>]*>([\s\S]*?)<div style=['"]clear: ?both;?['"]/i,
  );
  const rawBody = bodyMatch ? bodyMatch[1] : html;

  // ---- 2. html -> plain text ------------------------------------------

  const plain = decodeEntities(
    rawBody
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  // ---- 3. topic (prefer <meta property="og:title">) -------------------

  let topic = "";
  const ogTitleMatch =
    html.match(
      /<meta[^>]+property=['"]og:title['"][^>]+content=['"]([^'"]+)['"]/i,
    ) ||
    html.match(
      /<meta[^>]+content=['"]([^'"]+)['"][^>]+property=['"]og:title['"]/i,
    );
  if (ogTitleMatch) {
    topic = decodeEntities(ogTitleMatch[1])
      // strip a leading "Open Heaven(s) <day> <month> <year> – " prefix
      .replace(
        /^Open Heavens?\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*[\u2013\-]\s*/i,
        "",
      )
      .trim();
  }
  if (!topic) {
    const topicLineMatch = plain.match(
      /Open Heavens?\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\s+TOPIC\s*[\u2013\-]\s*(.+)/i,
    );
    if (topicLineMatch) topic = topicLineMatch[1].trim();
  }

  // ---- 4. split the body into labelled sections ------------------------
  // The site prefixes each major section with:
  //   "Open Heaven(s) <day> <month> <year> <SECTION LABEL>"
  // e.g. "...TOPIC", "...MESSAGE", "...PRAYER POINT", "...HYMN 27 – ..."

  const markerRegex =
    /Open Heavens?\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\s+(TOPIC|MESSAGE|PRAYER POINT|KEY POINT|ACTION POINT|HYMN(?:\s*\d+)?)\b[^\n]*/gi;

  const markers = [];
  let m;
  while ((m = markerRegex.exec(plain)) !== null) {
    markers.push({
      label: m[1]
        .replace(/\s*\d+$/, "")
        .trim()
        .toUpperCase(), // normalize e.g. "HYMN 27" -> "HYMN"
      start: m.index,
      end: m.index + m[0].length,
    });
  }

  const sectionAfter = (marker) => {
    if (!marker) return "";
    const idx = markers.indexOf(marker);
    const nextStart = markers[idx + 1] ? markers[idx + 1].start : plain.length;
    return plain.slice(marker.end, nextStart).trim();
  };

  const topicMarker = markers.find((mk) => mk.label === "TOPIC");
  const messageMarker = markers.find((mk) => mk.label === "MESSAGE");
  const conclusionMarker = markers.find((mk) =>
    ["PRAYER POINT", "KEY POINT", "ACTION POINT"].includes(mk.label),
  );

  // ---- 5. memory verse + bible reading (live inside the TOPIC section) -

  const preMessageChunk = topicMarker ? sectionAfter(topicMarker) : plain;

  let memory = "";
  const memoryMatch = preMessageChunk.match(
    /MEMORISE:\s*([\s\S]*?)(?=\n?READ:|\n?BIBLE IN ONE YEAR:|$)/i,
  );
  if (memoryMatch) memory = cleanBlock(memoryMatch[1]);

  let bibleText = "";
  const readMatch = preMessageChunk.match(
    /READ:\s*([\s\S]*?)(?=\n?BIBLE IN ONE YEAR:|$)/i,
  );
  if (readMatch) bibleText = cleanBlock(readMatch[1]);

  // ---- 6. devotional message --------------------------------------------

  let devotionalText = "";
  if (messageMarker) {
    devotionalText = cleanBlock(sectionAfter(messageMarker));
  }

  // ---- 7. conclusion (prayer point / key point / action point) ---------

  const typeMap = {
    "PRAYER POINT": "prayerPoint",
    "KEY POINT": "keyPoint",
    "ACTION POINT": "actionPoint",
  };

  let conclusion = { type: "reflection", data: "" };
  if (conclusionMarker) {
    let data = cleanBlock(sectionAfter(conclusionMarker));
    // strip the closing site boilerplate if it leaked into the last section
    data = data
      .replace(
        /Open Heavens?\s+\d{4}\s+Daily Devotional guide was written by[\s\S]*$/i,
        "",
      )
      .trim();
    conclusion = {
      type: typeMap[conclusionMarker.label] || "reflection",
      data,
    };
  }

  return {
    topic,
    memory,
    bibleText,
    devotional: devotionalText,
    conclusion,
  };
};
