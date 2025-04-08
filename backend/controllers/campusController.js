/**
 * Campus controller
 * Handles all campus-related operations
 */
const db = require("../models/db");

/**
 * Get all campuses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllCampuses = async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM Campus`);
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
 * Get campus by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getCampusById = async (req, res, next) => {
  try {
    const result = await db.getById("Campus", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Campus not found",
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
 * Create a new campus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createCampus = async (req, res, next) => {
  try {
    const { name } = req.body;

    const result = await db.insert("Campus", { name });

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a campus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateCampus = async (req, res, next) => {
  try {
    const { name } = req.body;
    const campusId = req.params.id;

    // Check if campus exists
    const checkResult = await db.getById("Campus", campusId);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Campus not found",
      });
    }

    // Prepare update data
    const campusData = {};

    if (name) campusData.name = name;

    const result = await db.update("Campus", campusId, campusData);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a campus
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteCampus = async (req, res, next) => {
  try {
    const result = await db.remove("Campus", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Campus not found",
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
