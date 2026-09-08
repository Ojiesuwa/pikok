import { generateScriptureDevotionalData } from "./generation/generateScriptureDevotionalData.js";
import { scrapeDevotional } from "./scraper/scrapeDevotional.js";
import { scrapeDevotionalLinks } from "./scraper/scrapeDevotionalLinks.js";
import { fetchVerses } from "./utils/fetchVerses.js";

// This is the entry file for js
console.log("Project Running");

// Testing
(async () => {
  // Test 1: Scraper
  const link = await scrapeDevotionalLinks();
  if (!link) return console.error("No Link");
  const devotionalDataStage1 = await scrapeDevotional(link);

  //   Test 2: Bible Verses
  const verses = await fetchVerses(["Psalm 3:3", "Psalm 91:1", "Genesis 1:1"]);
  console.log(verses);

  //   Test 3: Scriptured devotional
  const data = await generateScriptureDevotionalData(devotionalDataStage1);
  console.log(JSON.stringify(data));
})();
