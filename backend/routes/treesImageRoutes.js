/**
 * Trees Image routes
 * Defines all API routes for tree image-related operations
 */
const express = require("express");
const imageController = require("../controllers/treesImageController");
const router = express.Router();

// GET all tree images (with optional filters for speciesId and imageType)
router.get("/", imageController.getAllImages);

// GET single tree image by ID
router.get("/:id", imageController.getImageById);

// POST create new tree image
router.post("/", imageController.createImage);

// PUT update tree image
router.put("/:id", imageController.updateImage);

// DELETE tree image
router.delete("/:id", imageController.deleteImage);

module.exports = router;
