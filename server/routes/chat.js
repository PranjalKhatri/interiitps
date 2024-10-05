const express = require("express");
const router = express.Router();
const { chat, getChat, deleteChat, stream,getAllChats } = require("../controllers/chat");
const authenticateUser = require("../middleware/user");

router.post("/", stream);
// router.get("/", authenticateUser, getChat);
// router.post("/stream/",stream);
// router.get("/", getAllChats);
router.delete("/:userID",deleteChat);
module.exports = router;
