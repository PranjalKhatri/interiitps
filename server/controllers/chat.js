const {getResponseText, getMultiResponse} = require('../promptHandler.js');
const geminiModel = require("../config/genaimodel.js");
const User = require('../models/User.js');
const Chat = require('../models/Chat.js');

// async function getResponseText(prompt) {
//   const result = await geminiModel.generateContent(prompt);
//   return result.response.text();
// } 

const startChat = geminiModel.startChat({
  history: [
        {
            "role": "user",
            "parts": [
                {
                    "text": "Hello,my name is dhruv."
                }
            ]
        },
        {
            "role": "model",
            "parts": [
                {
                    "text": "Great to meet you, Dhruv."
                }
            ]
        },
    ],
  generationConfig: {
    maxOutputTokens: 500,
  },
});

const { getResponseText, getResponse } = require("../promptHandler");

const chat = async (req, res) => {

  const prompt = req.body.prompt;
  try {
      console.log("User: ", prompt);
      const result = await startChat.sendMessage(prompt);
      const response = result.response;
      const text = response.text();
      console.log("AI: ", text);
      res.json({
        message : text,
      })
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
}

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

module.exports = {
  chat,getChat
};
