const express = require("express");
const router = express.Router();
const birdTypeController = require("../controllers/birdsTypesController");

// BirdType routes
router.get("/", birdTypeController.getAllBirdTypes);
router.get("/:id", birdTypeController.getBirdTypeById);
router.post("/", birdTypeController.createBirdType);
router.put("/:id", birdTypeController.updateBirdType);
router.delete("/:id", birdTypeController.deleteBirdType);

module.exports = router;
