const express = require("express");
const router = express.Router();
const { chat, getChat, stream,getAllChats } = require("../controllers/chat");
const authenticateUser = require("../middleware/user");

router.post("/", authenticateUser, chat);
// router.get("/", authenticateUser, getChat);
router.post("/stream/", authenticateUser, stream);
// router.get("/", getAllChats);

module.exports = router;
