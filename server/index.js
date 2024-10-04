const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("./utils/logger");
const getResponseText = require("./prompthandler");
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST endpoint to handle chat
app.post("/chat", async (req, res) => {
  // TODO: Implement the chat functionality
});

// GET endpoint to handle chat
app.get("/stream", async (req, res) => {
  // TODO: Stream the response back to the client
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`server is running on port ${PORT}`);
  getResponseText("Hello").then((val)=>{
    console.log(val);
  })
});
