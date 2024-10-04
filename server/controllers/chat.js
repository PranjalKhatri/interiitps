const {getResponseText,getResponse} = require("../promptHandler");

const chat = async (req, res) => {
  const prompt = req.body.prompt;
  console.log(prompt);

  // Set headers for streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Start getting the response
  getResponse(prompt, res).then(()=>{res.end();});

  // End the response after the stream is complete
  // res.json({"success":"True"});
};
    const ans = await prompthandler(prompt);
    console.log(ans);

    res.json({ message: ans });
}
module.exports = {
  chat,
};

    chat
}

