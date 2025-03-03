export function chunkContent(
    content: string,
    // metadata: any,
    chunkSize: number = 800
  ): any[] {
    const paragraphs = content.split(/\n\s*\n/);
    const chunks: any[] = [];
    let currentChunk = "";
  
    for (const paragraph of paragraphs) {
      if (paragraph.trim().length === 0) continue; // Skip empty paragraphs
  
      if (
        currentChunk.length + paragraph.length > chunkSize &&
        currentChunk.length > 0
      ) {
        chunks.push({ text: currentChunk.trim()});
        currentChunk = "";
      }
  
      if (paragraph.length > chunkSize) {
        // If a single paragraph is too long, split it further
        let subChunks =
          paragraph.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];
        chunks.push(
          ...subChunks.map((sub) => ({
            text: sub.trim(),
            // metadata: { ...metadata },
          }))
        );
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      }
    }
  
    // if (currentChunk.trim().length > 0) {
    //   chunks.push({ text: currentChunk.trim(), metadata: { ...metadata } });
    // }
  
    return chunks;
}
