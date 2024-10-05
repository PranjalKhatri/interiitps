const express = require("express");
const router = express.Router();

const { chat, getChat, stream,getAllChats,uploadFile,deleteChat } = require("../controllers/chat");

const authenticateUser = require("../middleware/user");
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage to avoid saving the file locally

router.post("/", stream);

router.post("/stream/", authenticateUser, stream);
router.post('/upload', authenticateUser,upload.single('file'), uploadFile);

// router.get("/", getAllChats);
router.delete("/:userID",deleteChat);
module.exports = router;
