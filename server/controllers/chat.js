const { text } = require("body-parser");
const geminiModel = require("../config/genaimodel.js");
const Chat = require('../models/chat.js');

const getChat = async (userID) => {
  try {
    const chats = await Chat.find({ userId: userID }).sort({ createdAt: 1 });

    if (chats.length > 0) {
      const history = chats.map(chat => ({
        role: chat.role,
        parts: chat.parts,
      }));
      console.log("history one: ",history);
      return history; // Return the history array
    } else {
      return null; // Return null if no chats found
    }

  // eslint-disable-next-line no-unused-vars
  } catch (error) {
    throw new Error("Failed to retrieve chat history");
  }
};

// Main chat handler function
const chat = async (req, res) => {
  const prompt = req.body.prompt;
  console.log("Prompt is: ", prompt);
  const newChat = req.body.newChat;
  let history = [];

  if (!newChat) {
    const userID = req.body.userID;

    try {
      const oldChats = await getChat(userID);
      history = oldChats;
      console.log("oldChats 1st is: ",oldChats);

      if (!oldChats) {
        // return res.json({ message: "oldChats not found" }); // Send response if no history
        history = [];
      }

    } catch (error) {
      console.error("Error retrieving chat history:", error);
      return res.status(500).json({ message: "Error retrieving chat history" });
    }
  }


  const finalHistory = history.map(item => ({
    role: item.role,
    parts: [{text : item.parts[0].text}]
  }));

  console.log("final history is: ", finalHistory);


  const startChat = geminiModel.startChat({
    history: newChat ? [] : finalHistory, // Use retrieved history or an empty array
    generationConfig: {
        maxOutputTokens: 500,
    },
});


  try {
    console.log("User: ", prompt);
    const result = await startChat.sendMessage(prompt);
    const response = result.response;
    const text = await response.text(); // Ensure you await this call
    console.log("AI: ", text);

    const userChat = new Chat({
      userId: req.body.userID,
      role: "user",
      parts: [{ text: prompt }],
    });

    const modelChat = new Chat({
      userId: req.body.userID,
      role: "model",
      parts: [{ text: text }],
    });

    // Save the chats to the database
    await userChat.save();
    await modelChat.save();

    return res.json({ message: text }); // Return the AI response
  } catch (error) {
    console.error("Error in chat processing:", error);
    return res.status(500).json({ message: "Error processing chat" });
  }
};

const getAllChats = async (req,res) => {
  const userID = "6700be9f3bff66d6fb71385a";

  const chats = await Chat.find({userId : userID});
  console.log(chats);
  res.json(chats);
}

module.exports = {
  chat,getAllChats
};
