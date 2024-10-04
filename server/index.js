const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("./utils/logger");
const getResponseText = require("./prompthandler");
require("dotenv").config();
const chat  = require('./routes/chat')
const connectDB = require('./db/connect.js');

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

// Start the server
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Database connected successfully!");

    app.listen(port, async () => {
      console.log(`Server is listening on port ${port}...`);
      
      try {
        const val = await getResponseText("Hello");
        console.log(val);
      } catch (err) {
        console.error("Error fetching response text:", err);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

start();
