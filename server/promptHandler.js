const geminiModel = require("./config/genaimodel");

async function getresponse(prompt) {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
} 

module.exports = getresponse;
