const getResponseText = require("../promptHandler");

const chat = async (req, res) => {
  const prompt = req.body.prompt;
  console.log(prompt);

  const ans = await getResponseText(prompt);
  console.log(ans);

  res.json({ message: ans });
};
module.exports = {
  chat,
};
