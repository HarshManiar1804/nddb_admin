/**
 * Trees Image controller
 * Handles all tree image-related operations
 */
const db = require("../models/db");

/**
 * Get all tree images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllImages = async (req, res, next) => {
  try {
    let query = `
      SELECT 
        ti.ID, 
        ti.SpeciesID, 
        ti.ImageType, 
        ti.ImageURL, 
        s.TreeName AS treeName,
        s.ScientificName AS scientificName  
      FROM Trees_Image ti
      JOIN Species s ON ti.SpeciesID = s.ID
    `;

    const conditions = [];
    const values = [];

    if (req.query.speciesid) {
      conditions.push(`ti.SpeciesID = $${values.length + 1}`);
      values.push(req.query.speciesid);
    }

    if (req.query.imageType) {
      conditions.push(`ti.ImageType = $${values.length + 1}`);
      values.push(req.query.imageType);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in getAllImages:", error);
    next(error);
  }
};

/**
 * Get tree image by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getImageById = async (req, res, next) => {
  try {
    const result = await db.getById("Trees_Image", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tree image not found",
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
 * Create a new tree image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createImage = async (req, res, next) => {
  try {
    const { speciesid, imageType, imageUrl } = req.body;

    // Validate input
    if (!speciesid || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Please provide speciesid and imageUrl",
      });
    }

    // Check if species exists
    const speciesCheck = await db.getById("Species", speciesid);

    if (speciesCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species not found",
      });
    }

    const result = await db.insert("Trees_Image", {
      speciesid: speciesid,
      imagetype: imageType || null,
      imageurl: imageUrl,
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
 * Update a tree image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateImage = async (req, res, next) => {
  try {
    const { speciesid, imageType, imageUrl } = req.body;
    const imageId = req.params.id;

    // Check if image exists
    const checkResult = await db.getById("Trees_Image", imageId);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tree image not found",
      });
    }

    // Prepare update data
    const updateData = {};

    if (speciesid) {
      // Check if species exists
      const speciesCheck = await db.getById("Species", speciesid);

      if (speciesCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Species not found",
        });
      }

      updateData.speciesid = speciesid;
    }

    if (imageType !== undefined) updateData.imagetype = imageType;
    if (imageUrl) updateData.imageurl = imageUrl;

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    const result = await db.update("Trees_Image", imageId, updateData);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a tree image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const result = await db.remove("Trees_Image", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tree image not found",
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
