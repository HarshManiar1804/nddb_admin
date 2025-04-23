/**
 * Species Usage controller
 * Handles all species usage-related operations
 */
const db = require("../models/db");

/**
 * Get all species usages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllSpeciesUsages = async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM species_usage`);
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
 * Get species usage by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getSpeciesUsageById = async (req, res, next) => {
  try {
    const result = await db.getById("Species_Usage", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species usage not found",
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
 * Create a new species usage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createSpeciesUsage = async (req, res, next) => {
  try {
    const { speciesId, usagetitle, usagedescription } = req.body;

    // Validate required fields
    if (!speciesId) {
      return res.status(400).json({
        success: false,
        error: "speciesId is required",
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

    const result = await db.insert("Species_Usage", {
      speciesId,
      usagetitle,
      usagedescription,
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
 * Update a species usage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateSpeciesUsage = async (req, res, next) => {
  try {
    const { speciesId, usagetitle, usagedescription } = req.body;
    const usageId = req.params.id;

    // Check if species usage exists
    const checkResult = await db.getById("Species_Usage", usageId);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species usage not found",
      });
    }

    // Prepare update data
    const usageData = {};

    if (speciesId !== undefined) {
      // Check if species exists if updating speciesId
      const speciesCheck = await db.getById("Species", speciesId);
      if (speciesCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Species not found",
        });
      }
      usageData.speciesId = speciesId;
    }

    if (usagetitle !== undefined) usageData.usagetitle = usagetitle;
    if (usagedescription !== undefined)
      usageData.usagedescription = usagedescription;

    const result = await db.update("Species_Usage", usageId, usageData);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a species usage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteSpeciesUsage = async (req, res, next) => {
  try {
    const result = await db.remove("Species_Usage", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species usage not found",
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
