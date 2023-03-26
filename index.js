const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep track of word count history for each domain
const wordCountHistory = {};

// API endpoint to receive domain/website URL from client
app.post("/wordcount", async (req, res) => {
  const url = req.body.url;

  try {
    // Use axios to fetch HTML content of the website
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio to parse the HTML and extract text content
    const $ = cheerio.load(html);
    const text = $("body").text();

    // Count number of words in the text content
    const wordCount = text.split(/\s+/g).length;

    // Store the word count data in the history array
    if (!wordCountHistory[url]) {
      wordCountHistory[url] = [];
    }
    wordCountHistory[url].push(wordCount);

    // Send back the word count data in JSON format, including history
    res.json({ url, wordCount, history: wordCountHistory[url] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Unable to fetch word count data" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// Serve the word count history as a JSON endpoint
app.get("/history", (req, res) => {
  res.json(wordCountHistory);
});

// Start the server
app.listen(3000, () => console.log("Server started on port 3000"));
