import { parseDevotionalPage } from "../parser/parseDevotionalPage.js";
import { fetchPage } from "../utils/fetchPage.js";

export const scrapeDevotional = async (devotionalLink) => {
  try {
    console.log("Scraping Devotional...");
    const page = await fetchPage(devotionalLink, 20);

    const devotionalDataStage1 = parseDevotionalPage(page);
    console.log(devotionalDataStage1);
    return devotionalDataStage1;
  } catch (error) {
    console.error("Error: ", error);
    throw new Error("Error scraping Devotional");
  }
};
