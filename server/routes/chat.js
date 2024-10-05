const express = require("express");
const router = express.Router();
const { chat, getAllChats} = require("../controllers/chat.js");

router.post("/", chat);
router.get("/", getAllChats);

module.exports = router;
