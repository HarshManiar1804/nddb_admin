/**
 * Trees Geolocation routes
 * Defines all API routes for tree geolocation-related operations
 */
const express = require("express");
const geolocationController = require("../controllers/treesGeolocationController");
const router = express.Router();

// GET all tree geolocations (with optional speciesId filter)
router.get("/", geolocationController.getAllGeolocations);

// GET single tree geolocation by ID
router.get("/:id", geolocationController.getGeolocationById);

// POST create new tree geolocation
router.post("/", geolocationController.createGeolocation);

// PUT update tree geolocation
router.put("/:id", geolocationController.updateGeolocation);

// DELETE tree geolocation
router.delete("/:id", geolocationController.deleteGeolocation);

module.exports = router;
