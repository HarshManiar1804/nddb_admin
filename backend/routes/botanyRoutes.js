/**
 * Botany routes
 * Defines all API routes for botany-related operations
 */
const express = require("express");
const botanyController = require("../controllers/botanyController");
const router = express.Router();

// GET all botany entries
router.get("/", botanyController.getAllBotany);

// GET single botany entry by ID
router.get("/:id", botanyController.getBotanyById);

// POST create new botany entry
router.post("/", botanyController.createBotany);

// PUT update botany entry
router.put("/:id", botanyController.updateBotany);

// DELETE botany entry
router.delete("/:id", botanyController.deleteBotany);

module.exports = router;
