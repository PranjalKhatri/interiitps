const prompthandler = require('../promptHandler');

const chat = async (req, res) => {
    const prompt = req.body.prompt;
    console.log(prompt);

    const ans = await prompthandler(prompt);
    console.log(ans);

    res.json({ message: "hello" });
}
module.exports = {
    chat
}