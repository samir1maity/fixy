import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "../configs/db.js";
import { chunkContent } from "./contentProcessor.service.js";
import puppeteer from "puppeteer";

// Add a flag to determine if we should use headless browser
export async function scrapeGenericWebsite(url: string, useHeadlessBrowser: boolean = true) {
  try {
    let data: string;
    
    // Default to using Puppeteer for all sites
    if (useHeadlessBrowser) {
      // Use Puppeteer for JavaScript-rendered content
      data = await scrapeWithPuppeteer(url);
    } else {
      // Use traditional axios for static content
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml",
        },
        timeout: 15000,
      });
      data = response.data;
    }

    const $ = cheerio.load(data);

    // Remove script, style, and other non-content elements
    $('script, style, noscript, iframe, img, svg, canvas, nav, footer, header, [role="banner"], [role="navigation"]').remove();

    // Extract title
    const title = $("title").text().trim() || $("h1").first().text().trim();

    // Extract main content using common content containers
    let mainContent = "";

    // Try to find main content area using common selectors
    const contentSelectors = [
      "main", "article", "#content", ".content", ".post", ".article", 
      '[role="main"]', ".main-content", ".post-content", ".entry-content",
      "#root", ".container", ".app"
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
      $("p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div").each((_, el) => {
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

    let externalLinks: Set<string> = new Set();
    let internalLinks: Set<string> = new Set();

    links.forEach((link) => {
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

// Scrape with Puppeteer for JavaScript-rendered sites
async function scrapeWithPuppeteer(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for React to render content
    await page.waitForSelector('#root, .app, .container, main, article, #__next, [data-reactroot], .react-app', { 
      timeout: 30000 
    }).catch(() => console.log('No common React selectors found, continuing anyway'));
    
    // Scroll down to trigger lazy loading
    await autoScroll(page);
    
    // Wait additional time for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the page content
    const content = await page.content();
    
    return content;
  } finally {
    await browser.close();
  }
}

// Helper function to scroll down the page to trigger lazy loading
async function autoScroll(page: any) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
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

// Main function to recursively scrape a website
export async function scrapeWebsiteRecursively(
  rootUrl: string, 
  websiteId: number,
  maxDepth: number = 3, 
  maxPages: number = 30
): Promise<void> {
  const visitedUrls = new Set<string>();
  const urlQueue: Array<{url: string, depth: number}> = [];
  
  // Normalize and add root URL to queue
  const normalizedRootUrl = normalizeUrl(rootUrl);
  const rootDomain = extractDomain(normalizedRootUrl);
  urlQueue.push({url: normalizedRootUrl, depth: 0});
  
  // Update website status to processing
  await prisma.website.update({
    where: { id: websiteId },
    data: { status: 'pending' }
  });
  
  let pagesProcessed = 0;
  let successfulScrapes = 0;
  
  try {
    // Process URLs until queue is empty or limits are reached
    while (urlQueue.length > 0 && pagesProcessed < maxPages) {
      const {url, depth} = urlQueue.shift()!;
      
      // Skip if already visited or exceeds max depth
      if (visitedUrls.has(url) || depth > maxDepth) {
        continue;
      }
      
      visitedUrls.add(url);
      
      try {
        // Always use Puppeteer for better content extraction
        const scrapedData = await scrapeGenericWebsite(url, true);
        
        // Lower the content length threshold
        if (scrapedData.content && scrapedData.content.length > 50) {
          // Store page in database
          const page = await prisma.page.create({
            data: {
              websiteId,
              url,
              title: scrapedData.title || url,
              status: 'scraped',
              lastCrawledAt: new Date(),
            }
          });
          
          // Process content into chunks
          const chunks = chunkContent(scrapedData.content);

          // Store chunks
          if (chunks.length > 0) {
            for (let i = 0; i < chunks.length; i++) {
              await prisma.chunk.create({
                data: {
                  pageId: page.id,
                  chunkIndex: i,
                  text: chunks[i].text,
                }
              });
            }
            
            successfulScrapes++;
          }
          
          pagesProcessed++;
        }
        
        // Process internal links
        const internalLinks = processInternalLinks(
          Array.isArray(scrapedData.links) ? [] : (scrapedData.links?.internal || []), 
          url, 
          rootDomain
        );
        
        // Add new internal links to queue
        internalLinks.forEach(link => {
          if (!visitedUrls.has(link)) {
            urlQueue.push({url: link, depth: depth + 1});
          }
        });
        
        // Add a small delay to be polite to the server
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error processing ${url}:`, error);
        await prisma.page.upsert({
          where: { url },
          create: { websiteId, url, status: 'failed' },
          update: { status: 'failed' },
        });
      }
    }
    
    // Check if we successfully scraped any content
    if (successfulScrapes === 0) {
      // No successful scrapes, mark as failed
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: 'failed' }
      });
      throw new Error("We couldn't extract content from this website. The site may have content protection, use JavaScript rendering, or have a structure our system can't process. Please try a different website or contact support.");
    } else {
      // Update website status to embedding to start the embedding process
      await prisma.website.update({
        where: { id: websiteId },
        data: { 
          status: 'embedding',
          lastCrawledAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error(`Error in scraping process for website ${websiteId}:`, error);
    // Mark as failed if any error occurs in the overall process
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'failed' }
    });
    throw error; // Propagate the error to be caught by the controller
  }
}
