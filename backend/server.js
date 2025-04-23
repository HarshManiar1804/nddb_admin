/**
 * Main server file for NDDB backend
 * Initializes Express server and connects to database
 */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const db = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ======= MAIN NDDB ROUTES =======

// Import routes
const campusRoutes = require("./routes/campusRoutes");
const botanyRoutes = require("./routes/botanyRoutes");
const speciesRoutes = require("./routes/speciesRoutes");
const treesGeolocationRoutes = require("./routes/treesGeolocationRoutes");
const treesImageRoutes = require("./routes/treesImageRoutes");
const speciesUsageRoutes = require("./routes/speciesUsageRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const birdRoutes = require("./routes/birdsRoutes");
const birdTypeRoutes = require("./routes/birdsTypesRoutes");

// Dashboard routes
const botanyDashboardRoutes = require("./dashboard_backend/backend/routes/botanyRoutes");
const speciesDashboardRoutes = require("./dashboard_backend/backend/routes/speciesRoutes");
const geolocationDashboardRoutes = require("./dashboard_backend/backend/routes/geolocationRoutes");
const statsDashboardRoutes = require("./dashboard_backend/backend/routes/statsRoutes");
const birdDashboardRoutes = require("./dashboard_backend/backend/routes/birdsRoutes");
const birdTypeDashboardRoutes = require("./dashboard_backend/backend/routes/birdsTypeRoutes");

// Mount API routes
app.use("/api/campus", campusRoutes);
app.use("/api/botany", botanyRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/trees-geolocation", treesGeolocationRoutes);
app.use("/api/trees-image", treesImageRoutes);
app.use("/api/species-usage", speciesUsageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/birds", birdRoutes);
app.use("/api/bird-types", birdTypeRoutes);

// Mount dashboard routes
app.use("/dashboard/botany", botanyDashboardRoutes);
app.use("/dashboard/species", speciesDashboardRoutes);
app.use("/dashboard/geolocation", geolocationDashboardRoutes);
app.use("/dashboard/stats", statsDashboardRoutes);
app.use("/dashboard/birds", birdDashboardRoutes);
app.use("/dashboard/bird-types", birdTypeDashboardRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ msg: "NDDB API is running" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
