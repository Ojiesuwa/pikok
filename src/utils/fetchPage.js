import { retry } from "./retry.js";

export const fetchPage = async (pageLink, retries) => {
  try {
    const result = await retry(() => fetch(pageLink, { method: "GET" }), {
      retries: retries || 5,
    });
    if (!result.ok) {
      throw new Error("Error with page loading");
    }
    const page = await result.text();
    return page;
  } catch (error) {
    console.error("Error: ", error);
    throw new Error("Error Fetching Page");
  }
};
