const express = require("express");
const router = express.Router();
const { chat, getChat, stream } = require("../controllers/chat");
const authenticateUser = require("../middleware/user");

router.post("/", authenticateUser, chat);
router.get("/:userID", authenticateUser, getChat);
router.post("/stream/", authenticateUser, stream);

module.exports = router;
