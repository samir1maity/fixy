import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeGenericWebsite(url: string) {
  try {
    // Fetch the page with a reasonable timeout
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(data);
    
    // Remove script, style, and other non-content elements
    $('script, style, noscript, iframe, img, svg, canvas, nav, footer, header, [role="banner"], [role="navigation"]').remove();
    
    // Extract title
    const title = $('title').text().trim() || $('h1').first().text().trim();
    
    // Extract main content using common content containers
    let mainContent = '';
    
    // Try to find main content area using common selectors
    const contentSelectors = [
      'main', 'article', '#content', '.content', '.post', '.article', 
      '[role="main"]', '.main-content', '.post-content', '.entry-content'
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
      $('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote').each((_, el) => {
        const text = $(el).text().trim();
        if (text) {
          mainContent += text + '\n\n';
        }
      });
    }
    
    // If still no substantial content, get all text from body
    if (!mainContent || mainContent.length < 100) {
      mainContent = $('body').text().replace(/\s+/g, ' ').trim();
    }
    
    // Extract links
    const links: string[] = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });

    console.log('links', links);

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

export function chunkContent(content: string, metadata: any, chunkSize: number = 800): any[] {
  const paragraphs = content.split(/\n\s*\n/);
  const chunks: any[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (paragraph.trim().length === 0) continue; // Skip empty paragraphs

    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push({ text: currentChunk.trim(), metadata: { ...metadata } });
      currentChunk = "";
    }

    if (paragraph.length > chunkSize) {
      // If a single paragraph is too long, split it further
      let subChunks = paragraph.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];
      chunks.push(...subChunks.map((sub) => ({ text: sub.trim(), metadata: { ...metadata } })));
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ text: currentChunk.trim(), metadata: { ...metadata } });
  }

  return chunks;
}
