import express from 'express'
import { scrapeData } from './configs/cheerio.js';
import { getEmbedding } from './configs/embeddings.js';

const app = express()


const scrape = async () => {
    const data = await scrapeData("https://100xdevs.com/");
    console.log(data);
}
scrape();


const embedding = await getEmbedding("Hello, world!");
console.log(embedding);


app.listen(3000,()=>{
    console.log('server started at port 3000 ')
})