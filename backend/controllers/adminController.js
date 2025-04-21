// backend/controllers/adminController.js

// Dashboard controller
exports.getDashboard = (req, res) => {
  res.json({
    message: "Welcome to the protected dashboard",
    user: req.user,
  });
};
