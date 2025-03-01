import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeData = async (url: string) => {
  console.log("reached");
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const pageBody = $("body").html();

    const links: string[] = [];
    $('a').each((_, el) => {
        const link = $(el).attr('href');
        if (link) {
            links.push(link);
        }
    });

    console.log("Links:", links);

    // Example: Extract all article titles
    const titles: string[] = [];
    $("h2").each((_, element) => {
      titles.push($(element).text().trim());
    });

    console.log("Titles:", titles);
  } catch (error) {
    console.error("Error scraping:", error);
  }
};
