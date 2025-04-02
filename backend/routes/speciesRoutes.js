/**
 * Species routes
 * Defines all API routes for species-related operations
 */
const express = require("express");
const speciesController = require("../controllers/speciesController");
const router = express.Router();

// GET all species
router.get("/", speciesController.getAllSpecies);

// GET single species by ID
router.get("/:id", speciesController.getSpeciesById);

// POST create new species
router.post("/", speciesController.createSpecies);

// PUT update species
router.put("/:id", speciesController.updateSpecies);

// DELETE species
router.delete("/:id", speciesController.deleteSpecies);

module.exports = router;
