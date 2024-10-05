const {
  getResponseText,
  getMultiResponse,
  getResponse,
} = require("../promptHandler.js");
const geminiModel = require("../config/genaimodel.js");
const User = require("../models/User.js");
const Chat = require("../models/Chat.js");

// async function getResponseText(prompt) {
//   const result = await geminiModel.generateContent(prompt);
//   return result.response.text();
// }

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

const chat = async (req, res) => {
  const prompt = req.body.prompt;
  console.log("Prompt is: ", prompt);
  const newChat = req.body.newChat;
  console.log(newChat);
  let history = [];

  if (!newChat) {
    const userID = "6700be9f3bff66d6fb71385a";
    try {
      const oldChats = await getChat(userID);
      history = oldChats;
      console.log("oldChats 1st is: ", oldChats);

      if (!oldChats) {
        // return res.json({ message: "oldChats not found" }); // Send response if no history
        history = [];
      }
    } catch (error) {
      console.error("Error retrieving chat history:", error);
      return res.status(500).json({ message: "Error retrieving chat history" });
    }
  }

  const finalHistory = history.map((item) => ({
    role: item.role,
    parts: [{ text: item.parts[0].text }],
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
      userId: "6700be9f3bff66d6fb71385a",
      role: "user",
      parts: [{ text: prompt }],
    });

    const modelChat = new Chat({
      userId: "6700be9f3bff66d6fb71385a",
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

// const stream = async (req, res) => {
//   const userId = "6700be9f3bff66d6fb71385a";
//   console.log(userId);
//   const newChat = req.body.newChat;
//   let history = [];
//   if (!newChat) {
//     console.log("using history");
//     const allHistory = await Chat.find({ userId: userId });
//     // for await (const dat of allHistory) {
//     //   console.log(dat.parts);
//     //   history.push({ role: dat.role, parts: [{ text: dat.parts[0].text }] });
//     // }
//     history = allHistory.map((dat) => ({
//       role: dat.role,
//       parts: [{ text: dat.parts[0].text }],
//     }));
//     await console.log(history);
//   }

//   const prompt = req.body.prompt;
//   // Set headers for streaming response
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   // Start getting the response
//   res.setHeader("Content-Type", "text/plain");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   let modelChat = "";
//   // Start getting the response
//   getResponse(prompt, res, history).then((val) => {
//     console.log("val is: ", val);
//     modelChat = val; 
    
//     res.json({modelchat : modelChat});
//   }).catch(err => {
//     console.error('Error:', err);
//     res.status(500).json({ success: false, message: 'Failed to process chat response.' });
//   });

//   ////////add here?/////////



// };


const stream = async (req, res) => {
  const userId = "6700be9f3bff66d6fb71385a";
  console.log(userId);
  const newChat = req.body.newChat;
  let history = [];
  
  if (!newChat) {
    console.log("using history");
    const allHistory = await Chat.find({ userId: userId });
    history = allHistory.map((dat) => ({
      role: dat.role,
      parts: [{ text: dat.parts[0].text }],
    }));
    await console.log(history);
  }

  const prompt = req.body.prompt;
  
  // Set headers for streaming response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let modelChat = "";

  // Start getting the response
  getResponse(prompt, res, history)
    .then(async (val) => {  // Added 'async' to use await inside
      modelChat = val; 
      console.log("modelChat is: ", modelChat);
      
      // Save user and model chats only after the response is received
      const userChat = new Chat({
        userId: userId,
        role: "user",
        parts: [{ text: prompt }],
      });

      const modelResponseChat = new Chat({
        userId: userId,
        role: "model",
        parts: [{ text: modelChat }],
      });

      // // Save the chats to the database
      await userChat.save();
      await modelResponseChat.save();
      
      res.end();
    })
    
};



const getAllChats = async (req, res) => {
  const userID = "6700be9f3bff66d6fb71385a";

  const chats = await Chat.find({ userId: userID });
  console.log(chats);
  res.json(chats);
};

const deleteChat = async (req, res) => {
  const userID = req.params.userID;
  console.log(userID);
  try {
      const deletedChats = await Chat.deleteMany({ userId: userID });

      if (deletedChats.deletedCount > 0) {
          return res.status(200).json({
              status: 'success',
              message: 'Chats deleted successfully!',
              data: {
                  deletedCount: deletedChats.deletedCount,
              },
          });
      } else {
          return res.status(404).json({
              status: 'error',
              message: 'No chats found for this user ID.',
          });
      }
  } catch (error) {
      console.error('Error deleting chats:', error);
      return res.status(500).json({
          status: 'error',
          message: 'Internal server error.',
      });
  }
};

module.exports = {
  chat,
  getAllChats,
  stream,
  deleteChat,
};
