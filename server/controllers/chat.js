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

<<<<<<< HEAD
=======
const { getResponseText, getResponse } = require("../promptHandler");

const chat = async (req, res) => {
>>>>>>> ea7e05b612ce9a67bbfa1567498f77590a0d8603

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

<<<<<<< HEAD
=======
  // Set headers for streaming response
  // res.setHeader('Content-Type', 'text/event-stream');
  // res.setHeader('Cache-Control', 'no-cache');
  // res.setHeader('Connection', 'keep-alive');

  // Start getting the response
  // getResponseText(prompt).then(()=>{res.end();});
  // const ans = getMultiResponse(prompt);

  // ans.then((val) => {
  //   console.log(val);
  //   res.json({
  //     message: val,
  //   });
  // }).catch((error) => { 
  //   // console.log("Error:", error); 
  //   res.status(500).json({
  //     message: "Some error has occurred!",
  //   });
  // });

  const getChat = async (req, res) => {
    try {
        const userID = req.params.userID;
        const chat = await Chat.findOne({ userId: userID });
        if (chat) {
            const { role, parts } = chat; 

            const history = {
                role: role,
                parts: parts,
            };

            console.log(history);

            return res.json({ history });
        }

        return res.json({
            message: "Chat not found",
        });
    } catch (error) {
        return res.status(500).json({
            message: error,
        });
    }
};

//   res.setHeader("Content-Type", "text/plain");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   // Start getting the response
//   getResponse(prompt, res).then(() => {
//     res.end();
//   });
  // const text = getResponseText(prompt);
  // text.then((val)=>{console.log(val)})
  // End the response after the stream is complete
  // res.json({"success":"True"});
// };

>>>>>>> ea7e05b612ce9a67bbfa1567498f77590a0d8603
module.exports = {
  chat,getAllChats
};
