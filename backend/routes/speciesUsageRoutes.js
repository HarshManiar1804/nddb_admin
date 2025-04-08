/**
 * Species Usage routes
 * Defines API endpoints for species usage-related operations
 */
const express = require("express");
const router = express.Router();
const speciesUsageController = require("../controllers/speciesUsageController");

// Get all species usages
router.get("/", speciesUsageController.getAllSpeciesUsages);

// Get species usage by ID
router.get("/:id", speciesUsageController.getSpeciesUsageById);

// Create a new species usage
router.post("/", speciesUsageController.createSpeciesUsage);

// Update a species usage
router.put("/:id", speciesUsageController.updateSpeciesUsage);

// Delete a species usage
router.delete("/:id", speciesUsageController.deleteSpeciesUsage);

module.exports = router;
