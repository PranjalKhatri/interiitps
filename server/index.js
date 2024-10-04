const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
const logger = require("./utils/logger");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chat = require('./routes/chat.js')
// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

// Initialize OpenAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST endpoint to handle chat
// app.post("/chat", async (req, res) => {
//   // TODO: Implement the chat functionality
// });
app.use("/api/v1/chat",chat)

// GET endpoint to handle chat
app.get("/stream", async (req, res) => {
  // TODO: Stream the response back to the client
});


async function getprompt() {
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "Write a story about a magic backpack.";

  const result = await model.generateContent(prompt);
  // console.log(result.response.text());
}
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`server is running on port ${PORT}`);
  getprompt();
});