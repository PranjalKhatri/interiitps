const express = require("express");
const router = express.Router();
const { chat, getChat, stream } = require("../controllers/chat.js");

router.post("/", chat);
router.get("/:userID", getChat);
router.post("/stream/:userID", stream);

module.exports = router;
