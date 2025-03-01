import express from 'express'
import { scrapeData } from './configs/cheerio';

const app = express()

scrapeData("https://github.com/samir1maity/fixy");


app.listen(3000,()=>{
    console.log('server started at port 3000 ')
})