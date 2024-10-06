// const User = require("../models/User");
const logger = require("../utils/logger");
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  // const token = req.headers.authorization?.split(" ")[1];
  const token = req.cookies.token; // Access token from the cookie
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    console.log(decoded);
    next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticateUser;
