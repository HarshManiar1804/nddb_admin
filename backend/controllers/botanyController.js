/**
 * Botany controller
 * Handles all botany-related operations
 */
const db = require("../models/db");

/**
 * Get all botany entries
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllBotany = async (req, res, next) => {
  try {
    const result = await db.getAll("Botany");

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
 * Get botany entry by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getBotanyById = async (req, res, next) => {
  try {
    const result = await db.getById("Botany", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Botany entry not found",
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
 * Create a new botany entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createBotany = async (req, res, next) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Please provide a name for the botany entry",
      });
    }

    const result = await db.insert("Botany", { name });

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a botany entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateBotany = async (req, res, next) => {
  try {
    const { name } = req.body;
    const botanyId = req.params.id;

    // Check if botany entry exists
    const checkResult = await db.getById("Botany", botanyId);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Botany entry not found",
      });
    }

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Please provide a name for the botany entry",
      });
    }

    const result = await db.update("Botany", botanyId, { name });

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a botany entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteBotany = async (req, res, next) => {
  try {
    // Check for related species before deleting
    const relatedSpecies = await db.query(
      "SELECT COUNT(*) FROM Species WHERE BotanyID = $1",
      [req.params.id]
    );

    if (parseInt(relatedSpecies.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete botany entry with related species",
      });
    }

    const result = await db.remove("Botany", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Botany entry not found",
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
