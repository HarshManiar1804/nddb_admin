/**
 * Main server file for NDDB backend
 * Initializes Express server and connects to database
 */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// const { errorHandler } = require("./middleware/errorHandler");
const db = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Import routes
const campusRoutes = require("./routes/campusRoutes");
const botanyRoutes = require("./routes/botanyRoutes");
const speciesRoutes = require("./routes/speciesRoutes");
const treesGeolocationRoutes = require("./routes/treesGeolocationRoutes");
const treesImageRoutes = require("./routes/treesImageRoutes");
const speciesUsageRoutes = require("./routes/speciesUsageRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Mount routes
app.use("/api/campus", campusRoutes); // done
app.use("/api/botany", botanyRoutes); // done
app.use("/api/species", speciesRoutes); // done
app.use("/api/trees-geolocation", treesGeolocationRoutes); //done
app.use("/api/trees-image", treesImageRoutes); // done
app.use("/api/species-usage", speciesUsageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ msg: "NDDB API is running" });
});

// Error handler middleware
// app.use(errorHandler);

// Set port and start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
