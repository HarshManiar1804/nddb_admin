// backend/config/config.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: "365d",
};
