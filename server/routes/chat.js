const express = require("express");
const router = express.Router();
const {deleteChat, stream, uploadFile } = require("../controllers/chat");
const authenticateUser = require("../middleware/user");
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
router.post("/", stream);

router.post("/stream" , stream);
router.post('/upload', authenticateUser,upload.single('file'), uploadFile);

// router.get("/", getAllChats);
router.delete("/:userID",deleteChat);
module.exports = router;
