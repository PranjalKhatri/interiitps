const geminiModel = require("./config/genaimodel");

async function getResponseText(prompt) {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

module.exports = { getResponseText };
