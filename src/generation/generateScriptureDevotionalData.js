import { parseBibleText } from "../parser/parseBibleText.js";
import { fetchVerseRange, fetchVerses } from "../utils/fetchVerses.js";
import { getVerseFromMv } from "../utils/getVerseFromMV.js";
import { getVersesFromBT } from "../utils/getVersesFromBT.js";

export const generateScriptureDevotionalData = async (devotinalDataStage1) => {
  try {
    // Memory Verse Deduction
    if (!devotinalDataStage1.memory)
      throw new Error("No devotional memory verse");
    const memoryVerse = getVerseFromMv(devotinalDataStage1.memory);
    const memoryVerseScripture = await fetchVerses([memoryVerse]);
    const memoryVerseBibleText = `${memoryVerse}: ${memoryVerseScripture}`;
    // console.log("Debug: ", memoryVerseBibleText);

    // Bible Text Deduction
    if (!devotinalDataStage1.bibleText)
      throw new Error("No devotional bible text");
    const bibleText = getVersesFromBT(devotinalDataStage1.bibleText);
    const bibleTextScripture = await fetchVerses(bibleText);
    const bibleTextBibleText = bibleTextScripture.map(
      (data, index) => `${bibleText[index]}: ${data}`,
    );
    // console.log("Debug: ", bibleTextBibleText);

    // Devotional Segregation
    if (!devotinalDataStage1.devotional) throw new Error("No devotional");
    const segregatedDevotion = parseBibleText(devotinalDataStage1.devotional);
    // console.log("Debug: ", segregatedDevotion);
    // Devotional bible data
    let devotionalBibleText = [];
    for (const data of segregatedDevotion) {
      if (data.type === "text") {
        devotionalBibleText.push(data);
      } else {
        const bibleVerses = await fetchVerseRange(data.data);
        devotionalBibleText.push({ type: "bible", bible: bibleVerses });
      }
    }
    // console.log("Debug: ", devotionalBibleText);
    // Return Data here
    return {
      topic: devotinalDataStage1.topic,
      bibleText: bibleTextBibleText,
      memoryVerse: memoryVerseBibleText,
      devotional: devotionalBibleText,
      conclusion: devotinalDataStage1.conclusion,
    };
  } catch (error) {
    console.error("Error: ", error);
    throw new Error(" Error Generating Scripture Devotional");
  }
};
