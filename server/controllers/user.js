const User = require("../models/User");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    const user = new User({ name, email, password });
    await user.save();

    const token = user.createJWT();
    res.status(201).json({ userId: user._id, name: user.name, token });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Server error, unable to register" });
  }
};

// Login route
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = user.createJWT();
    res.status(200).json({ userId: user._id, name: user.name, token });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: "Server error, unable to login" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
