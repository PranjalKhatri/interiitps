const express = require("express");
const router = express.Router();
const { chat, getChat} = require("../controllers/chat.js");

router.post("/", chat);
router.get("/:userID", getChat);


module.exports = router;
