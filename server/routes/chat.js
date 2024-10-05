const express = require("express");
const router = express.Router();
const {deleteChat, stream } = require("../controllers/chat");
// const authenticateUser = require("../middleware/user");

router.post("/", stream);

router.post("/stream/", authenticateUser, stream);
router.post('/upload', authenticateUser,upload.single('file'), uploadFile);

// router.get("/", getAllChats);
router.delete("/:userID",deleteChat);
module.exports = router;
