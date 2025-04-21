// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const config = require("../config/config");

// Login controller
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Check credentials against environment variables
  if (username === config.adminUsername && password === config.adminPassword) {
    // Create JWT token
    const token = jwt.sign({ username, role: "admin" }, config.jwtSecret, {
      expiresIn: config.jwtExpiration,
    });

    return res.json({
      success: true,
      message: "Authentication successful",
      token,
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }
};
