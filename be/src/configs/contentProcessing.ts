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
    
    return {
      url,
      title,
      content: mainContent,
      links
    };
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      url,
      //@ts-ignore
      error: error.message,
      content: "",
      links: [],
    };
  }
}


export function chunkContent(content: string, metadata: any, chunkSize: number = 350): any[] {
  const paragraphs = content.split(/\n\s*\n/);

  const chunks: any[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (
      currentChunk.length + paragraph.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        text: currentChunk.trim(),
        metadata: { ...metadata },
      });
      currentChunk = "";
    }

    currentChunk += paragraph + "\n\n";
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: { ...metadata },
    });
  }

  return chunks;
}