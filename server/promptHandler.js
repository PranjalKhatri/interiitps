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
async function getResponse(prompt, res, history = []) {
  try {
    const conversationSession = geminiModel.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });
    const result = await conversationSession.sendMessageStream(prompt);
    let text = "";
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      console.log("AI: ", chunkText);
      res.write(JSON.stringify({ success: true, data: chunkText }));
      res.flush();
      text += chunkText;
    }
    return text;
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

module.exports = {
  getResponseText,
  getMultiResponse,
  getResponse,
};
