/**
 * Campus routes
 * Defines all API routes for campus-related operations
 */
const express = require("express");
const campusController = require("../controllers/campusController");
const router = express.Router();

// GET all campuses
router.get("/", campusController.getAllCampuses);

// GET single campus by ID
router.get("/:id", campusController.getCampusById);

// POST create new campus
router.post("/", campusController.createCampus);

// PUT update campus
router.put("/:id", campusController.updateCampus);

// DELETE campus
router.delete("/:id", campusController.deleteCampus);

module.exports = router;
