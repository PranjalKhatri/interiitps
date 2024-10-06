const express = require("express");
const router = express.Router();
const { deleteChat, stream, uploadFile, getAllChats } = require("../controllers/chat");
const authenticateUser = require("../middleware/user");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
  });
  
// Route for streaming
router.post("/", stream);
router.get("/", getAllChats);


// Route for file upload
router.post('/upload', upload.single('file'), uploadFile);

// Route for deleting a chat
router.delete("/:userID", deleteChat);

module.exports = router;
