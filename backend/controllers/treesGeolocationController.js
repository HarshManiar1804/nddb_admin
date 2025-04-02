/**
 * Trees Geolocation controller
 * Handles all tree geolocation-related operations
 */
const db = require("../models/db");

/**
 * Get all tree geolocations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllGeolocations = async (req, res, next) => {
  try {
    let query = "SELECT * FROM Trees_Geolocation";
    const values = [];

    // Filter by species if provided
    if (req.query.speciesId) {
      query = "SELECT * FROM Trees_Geolocation WHERE SpeciesID = $1";
      values.push(req.query.speciesId);
    }

    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tree geolocation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getGeolocationById = async (req, res, next) => {
  try {
    const result = await db.getById("Trees_Geolocation", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tree geolocation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new tree geolocation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createGeolocation = async (req, res, next) => {
  try {
    const { speciesId, longitude, latitude } = req.body;

    // Validate input
    if (!speciesId || !longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: "Please provide speciesId, longitude, and latitude",
      });
    }

    // Check if species exists
    const speciesCheck = await db.getById("Species", speciesId);

    if (speciesCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species not found",
      });
    }

    const result = await db.insert("Trees_Geolocation", {
      speciesid: speciesId,
      longitude,
      latitude,
    });

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a tree geolocation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateGeolocation = async (req, res, next) => {
  try {
    const { speciesId, longitude, latitude } = req.body;
    const geolocationId = req.params.id;

    // Check if geolocation exists
    const checkResult = await db.getById("Trees_Geolocation", geolocationId);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tree geolocation not found",
      });
    }

    // Prepare update data
    const updateData = {};

    if (speciesId) {
      // Check if species exists
      const speciesCheck = await db.getById("Species", speciesId);

      if (speciesCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Species not found",
        });
      }

      updateData.speciesid = speciesId;
    }

    if (longitude) updateData.longitude = longitude;
    if (latitude) updateData.latitude = latitude;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    const result = await db.update(
      "Trees_Geolocation",
      geolocationId,
      updateData
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a tree geolocation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteGeolocation = async (req, res, next) => {
  try {
    const result = await db.remove("Trees_Geolocation", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tree geolocation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
