/**
 * Species controller
 * Handles all species-related operations
 */
const db = require("../models/db");

/**
 * Get all species
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllSpecies = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT s.*, b.name AS botany_name, c.name AS campus_name
      FROM Species s
      LEFT JOIN Botany b ON s.BotanyID = b.ID
      LEFT JOIN Campus c ON s.CampusID = c.ID
    `);

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
 * Get species by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getSpeciesById = async (req, res, next) => {
  try {
    const speciesId = req.params.id;

    // Get species details
    const speciesResult = await db.query(
      `
      SELECT s.*, b.name AS botany_name, c.name AS campus_name
      FROM Species s
      LEFT JOIN Botany b ON s.BotanyID = b.ID
      LEFT JOIN Campus c ON s.CampusID = c.ID
      WHERE s.ID = $1
    `,
      [speciesId]
    );

    if (speciesResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species not found",
      });
    }

    // Get related geolocation data
    const geoResult = await db.query(
      "SELECT * FROM Trees_Geolocation WHERE SpeciesID = $1",
      [speciesId]
    );

    // Get related image data
    const imageResult = await db.query(
      "SELECT * FROM Trees_Image WHERE SpeciesID = $1",
      [speciesId]
    );

    // Get related usage data
    const usageResult = await db.query(
      "SELECT * FROM Species_Usage WHERE SpeciesID = $1",
      [speciesId]
    );

    // Get related symbols data
    const symbolsResult = await db.query(
      "SELECT * FROM Species_Symbols WHERE SpeciesID = $1",
      [speciesId]
    );

    // Combine all data
    const speciesData = {
      ...speciesResult.rows[0],
      geolocations: geoResult.rows,
      images: imageResult.rows,
      usages: usageResult.rows,
      symbols: symbolsResult.rows,
    };

    res.status(200).json({
      success: true,
      data: speciesData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new species
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createSpecies = async (req, res, next) => {
  try {
    const {
      treeName,
      scientificName,
      hindiName,
      centreOfOrigin,
      geographicalDistribution,
      iucnStatus,
      totalNDDBCampus,
      qrCode,
      link,
      botanyId,
      campusId,
    } = req.body;

    // Set the current user as creator
    const userData = {
      treeName: treeName,
      scientificName: scientificName,
      hindiName: hindiName || null,
      centreOfOrigin: centreOfOrigin || null,
      geographicalDistribution: geographicalDistribution || null,
      iucnStatus: iucnStatus || null,
      totalNDDBCampus: totalNDDBCampus || 0,
      qrCode: qrCode || null,
      link: link || null,
      botanyId: botanyId,
      campusId: campusId || null,
    };

    // Insert the species record
    const result = await db.query(
      `
      INSERT INTO Species (
        treename, scientificname, hindiname, centreoforigin, 
        geographicaldistribution, iucnstatus, totalnddbcampus, 
        qrcode, link, botanyid, campusid
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `,
      [
        userData.treeName,
        userData.scientificName,
        userData.hindiName,
        userData.centreOfOrigin,
        userData.geographicalDistribution,
        userData.iucnStatus,
        userData.totalNDDBCampus,
        userData.qrCode,
        userData.link,
        userData.botanyId,
        userData.campusId,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a species
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateSpecies = async (req, res, next) => {
  try {
    const speciesId = req.params.id;

    // Check if species exists
    const checkResult = await db.getById("Species", speciesId);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species not found",
      });
    }

    // Extract fields from request body
    const {
      treeName,
      scientificName,
      hindiName,
      centreOfOrigin,
      geographicalDistribution,
      iucnStatus,
      totalNDDBCampus,
      qrCode,
      link,
      isActive,
      botanyId,
      campusId,
    } = req.body;

    // Build update fields and values
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (treeName !== undefined) {
      fields.push(`TreeName = $${paramCount++}`);
      values.push(treeName);
    }

    if (scientificName !== undefined) {
      fields.push(`ScientificName = $${paramCount++}`);
      values.push(scientificName);
    }

    if (hindiName !== undefined) {
      fields.push(`HindiName = $${paramCount++}`);
      values.push(hindiName);
    }

    if (centreOfOrigin !== undefined) {
      fields.push(`CentreOfOrigin = $${paramCount++}`);
      values.push(centreOfOrigin);
    }

    if (geographicalDistribution !== undefined) {
      fields.push(`GeographicalDistribution = $${paramCount++}`);
      values.push(geographicalDistribution);
    }

    if (iucnStatus !== undefined) {
      fields.push(`IUCNStatus = $${paramCount++}`);
      values.push(iucnStatus);
    }

    if (totalNDDBCampus !== undefined) {
      fields.push(`TotalNDDBCampus = $${paramCount++}`);
      values.push(totalNDDBCampus);
    }

    if (qrCode !== undefined) {
      fields.push(`QRCode = $${paramCount++}`);
      values.push(qrCode);
    }

    if (link !== undefined) {
      fields.push(`Link = $${paramCount++}`);
      values.push(link);
    }

    if (isActive !== undefined) {
      fields.push(`IsActive = $${paramCount++}`);
      values.push(isActive);
    }

    if (botanyId !== undefined) {
      fields.push(`BotanyID = $${paramCount++}`);
      values.push(botanyId);
    }

    if (campusId !== undefined) {
      fields.push(`CampusID = $${paramCount++}`);
      values.push(campusId);
    }

    // Add the modify user and set the ModifyDate
    if (req.user) {
      fields.push(`ModifyBy = $${paramCount++}`);
      values.push(req.user.id);
    }

    // If no fields to update
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    // Add the ID as the last parameter
    values.push(speciesId);

    // Build and execute the update query
    const result = await db.query(
      `
      UPDATE Species
      SET ${fields.join(", ")}
      WHERE ID = $${paramCount}
      RETURNING *
    `,
      values
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
 * Delete a species
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteSpecies = async (req, res, next) => {
  try {
    const result = await db.remove("Species", req.params.id);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Species not found",
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
