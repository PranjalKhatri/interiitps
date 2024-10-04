const geminiModel = require("./config/genaimodel");

async function getResponseText(prompt) {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
} 

const chat = geminiModel.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 500,
  },
});

async function getMultiResponse(prompt) {
  console.log("User: ", prompt);
  try {
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    console.log("AI: ", text);
    return text; 
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw error;
  }
}


// async function getResponse(prompt,res) {
//   const result = await chat.sendMessageStream(prompt);
//   let text = "";
//   for await(const chunk of result.stream){
//     const chunkText = await chunk.text();
//     console.log("AI: ",chunkText);
//     res.write(chunkText);
//     text += chunkText;
//   };
//   // const response = await result.response;
//   // const text = await response.text();
//   // chat.getHistory().then((val) => {
//   //   console.log(val);
//   // });
//   return text;
// }

module.exports = {
  getResponseText, 
  getMultiResponse,
};
