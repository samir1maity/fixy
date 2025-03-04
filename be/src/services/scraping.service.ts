import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../configs/db.js";
import { chunkContent } from "./contentProcessor.service.js";

export async function scrapeGenericWebsite(url: string) {
  try {
    // Fetch the page with a reasonable timeout
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    // Remove script, style, and other non-content elements
    $(
      'script, style, noscript, iframe, img, svg, canvas, nav, footer, header, [role="banner"], [role="navigation"]'
    ).remove();

    // Extract title
    const title = $("title").text().trim() || $("h1").first().text().trim();

    // Extract main content using common content containers
    let mainContent = "";

    // Try to find main content area using common selectors
    const contentSelectors = [
      "main",
      "article",
      "#content",
      ".content",
      ".post",
      ".article",
      '[role="main"]',
      ".main-content",
      ".post-content",
      ".entry-content",
    ];

    // Try each selector until we find content
    for (const selector of contentSelectors) {
      const content = $(selector).text().trim();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }

    // If no content found with specific selectors, extract from body with structure
    if (!mainContent || mainContent.length < 100) {
      // Get all paragraphs and headings
      $("p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote").each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
          mainContent += text + "\n\n";
        }
      });
    }

    // If still no substantial content, get all text from body
    if (!mainContent || mainContent.length < 100) {
      mainContent = $("body").text().replace(/\s+/g, " ").trim();
    }

    // Extract links
    const links: string[] = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href) links.push(href);
    });

    // console.log("links", links);

    let externalLinks: Set<string> = new Set();
    let internalLinks: Set<string> = new Set();

    links.map((link) => {
      if (link.startsWith("http") || link.startsWith("https")) {
        externalLinks.add(link);
      } else {
        internalLinks.add(link);
      }
    });

    return {
      url,
      title,
      content: mainContent,
      links: {
        external: Array.from(externalLinks),
        internal: Array.from(internalLinks),
      },
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      url,
      content: "",
      links: [],
    };
  }
}

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash
    return urlObj.href.replace(/\/$/, '');
  } catch (e) {
    return url;
  }
}

// Helper function to extract domain
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

// Helper function to process internal links
function processInternalLinks(
  internalLinks: string[], 
  baseUrl: string, 
  rootDomain: string
): string[] {
  const processedLinks: string[] = [];
  
  internalLinks.forEach(link => {
    try {
      // Skip anchor links, javascript, mailto, etc.
      if (link.startsWith('#') || 
          link.startsWith('javascript:') || 
          link.startsWith('mailto:') ||
          link.startsWith('tel:')) {
        return;
      }
      
      // Resolve relative URL
      const fullUrl = new URL(link, baseUrl).toString();
      const linkDomain = extractDomain(fullUrl);
      
      // Only include links from the same domain
      if (linkDomain === rootDomain && !fullUrl.includes('#')) {
        processedLinks.push(normalizeUrl(fullUrl));
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  return processedLinks;
}

export async function scrapeWebsiteRecursively(
  rootUrl: string, 
  websiteId: number,
  maxDepth: number = 3, 
  maxPages: number = 100
): Promise<void> {
  const visitedUrls = new Set<string>();
  const urlQueue: Array<{url: string, depth: number}> = [];
  
  // Normalize and add root URL to queue
  const normalizedRootUrl = normalizeUrl(rootUrl);
  const rootDomain = extractDomain(normalizedRootUrl);
  urlQueue.push({url: normalizedRootUrl, depth: 0});
  
  // Update website status to processing Todo: Implement this
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'processing' }
  });
  
  let pagesProcessed = 0;
  
  // Process URLs until queue is empty or limits are reached
  while (urlQueue.length > 0 && pagesProcessed < maxPages) {
    const {url, depth} = urlQueue.shift()!;
    
    // Skip if already visited or exceeds max depth
    if (visitedUrls.has(url) || depth > maxDepth) {
      continue;
    }
    
    console.log(`Scraping ${url} (depth: ${depth})`);
    visitedUrls.add(url);
    
    try {
      // Scrape the current page
      const scrapedData = await scrapeGenericWebsite(url);
      
      if (scrapedData.content) {
        // Store page in database Todo: Implement this
        const page = await prisma.page.create({
          data: {
            websiteId,
            url,
            title: scrapedData.title
          }
        });
        
        // Process content into chunks
        const chunks = chunkContent(scrapedData.content);

        console.log("chunks", chunks);

        // Store chunks
        for (let i = 0; i < chunks.length; i++) {

          const temp = {
            chunkIndex: i,
            text: chunks[i],
            pageId: page.id,
            // tokenCount: estimateTokens(chunks[i]) // TODO: Implement this
          }

          console.log("temp", temp);
          // Todo: Implement this
          await prisma.chunk.create({
            data: {
              pageId: page.id,
              chunkIndex: i,
              text: chunks[i].text,
              // tokenCount: estimateTokens(chunks[i]) // TODO: Implement this
            }
          });
        }
        
        pagesProcessed++;
      }
      
      // Process internal links
      const internalLinks = processInternalLinks(
        //@ts-ignore
        scrapedData.links.internal, 
        url, 
        rootDomain
      );
      
      // Add new internal links to queue
      internalLinks.forEach(link => {
        if (!visitedUrls.has(link)) {
          urlQueue.push({url: link, depth: depth + 1});
        }
      });
      
      // Optional: Add a small delay to be polite to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }
  
  // Update website status to completed Todo: Implement this
  await prisma.website.update({
    where: { id: websiteId },
    data: { 
      status: 'completed',
      lastCrawledAt: new Date()
    }
  });
}
