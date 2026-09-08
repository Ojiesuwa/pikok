import { parseDevotionalLinksPage } from "../parser/parseDevotionalLinksPage.js";
import { fetchPage } from "../utils/fetchPage.js";

export const scrapeDevotionalLinks = async () => {
  try {
    const pageHtml = await fetchPage("https://www.openheavens.com.ng");
    console.log("Debug, ", pageHtml);

    const devotionalLink = parseDevotionalLinksPage(pageHtml);
    console.log("Debug: ", devotionalLink);
    return devotionalLink;
  } catch (error) {
    console.error("Error: ", error);
    throw new Error(error);
  }
};
