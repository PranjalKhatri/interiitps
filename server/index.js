const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const logger = require("./utils/logger");
require("dotenv").config();
const chat = require("./routes/chat");
const userRoutes = require("./routes/user");

const connectToDb = require("./config/db_config");
const compression = require("compression");

// Initialize Express app
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Frontend's origin
  credentials: true, // Allow sending cookies from frontend
}));
app.use(bodyParser.json());

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for JSON bodies
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Increase limit for URL-encoded bodies
app.use(bodyParser.text());
app.use(compression());
// Initialize OpenAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST endpoint to handle chat
// app.post("/chat", async (req, res) => {
//   // TODO: Implement the chat functionality
// });
app.use("/api/v1/chat", chat);
app.use("/api/v1/users", userRoutes);
// GET endpoint to handle chat
// app.get("/stream", async (req) => {
//   // TODO: Stream the response back to the client
// });

// Start the server
const port = process.env.PORT || 9000;

const start = async () => {
  try {
    await connectToDb(process.env.MONGO_URI);
    console.log("Database connected successfully!");

    app.listen(port, async () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
