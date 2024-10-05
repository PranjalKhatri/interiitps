const express = require("express");
const router = express.Router();
const { chat, getChat, stream,getAllChats,uploadFile } = require("../controllers/chat");
const authenticateUser = require("../middleware/user");
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage to avoid saving the file locally

router.post("/", authenticateUser, chat);
// router.get("/", authenticateUser, getChat);
router.post("/stream/", authenticateUser, stream);
router.post('/upload', authenticateUser,upload.single('file'), uploadFile);

// router.get("/", getAllChats);

module.exports = router;
