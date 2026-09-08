export const parseBibleText = (text) => {
  // Only matches Bible references inside parentheses:
  //
  // (John 10:10)
  // (1 Samuel 16:11-13)
  // (2 Corinthians 5:17)
  // (Psalm 23:1-6)

  const bibleRegex =
    /\(((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?)\)/g;

  const result = [];
  let lastIndex = 0;

  for (const match of text.matchAll(bibleRegex)) {
    const index = match.index;

    // Text before the Bible reference
    if (index > lastIndex) {
      result.push({
        type: "text",
        data: text.slice(lastIndex, index),
      });
    }

    // match[1] contains the reference without parentheses
    result.push({
      type: "bible",
      data: match[1].trim(),
    });

    lastIndex = index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    result.push({
      type: "text",
      data: text.slice(lastIndex),
    });
  }

  return result;
};
