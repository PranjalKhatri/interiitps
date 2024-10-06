const express = require("express");
const router = express.Router();
const { registerUser,getAllUsers, loginUser } = require("../controllers/user");

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);
router.get("/", getAllUsers);


module.exports = router;
