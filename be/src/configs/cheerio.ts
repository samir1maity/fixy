import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeData = async (url: string) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const pageBody = $("body").html();
    const pageHead = $("head").html();

    const internalLinks = new Set<string | undefined>();
    const externalLinks = new Set<string | undefined>();

    $("a").each((_, el) => {
      const link = $(el).attr("href");

      if (link === "/") return;
      if (link && (link.startsWith("http") || link.startsWith("https"))) {
        externalLinks.add(link);
      } else {
        internalLinks.add(link);
      }
    });

    return {
        head: pageHead,
        body: pageBody,
        internalLinks,
        externalLinks
    }

  } catch (error) {
    console.error("Error scraping:", error);
  }
};
