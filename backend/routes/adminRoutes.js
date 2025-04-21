// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Admin routes - all protected with auth middleware
router.get(
  "/dashboard",
  authMiddleware.authenticateToken,
  adminController.getDashboard
);

module.exports = router;
