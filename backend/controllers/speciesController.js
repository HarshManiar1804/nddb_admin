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

    // Combine all data
    const speciesData = {
      ...speciesResult.rows[0],
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
      treename,
      scientificname,
      hindiname,
      centreoforigin,
      geographicaldistribution,
      iucnstatus,
      totalnddbcampus,
      qrcode,
      link,
      botanyid,
      campusid,
    } = req.body;

    // Set the current user as creator
    const userData = {
      treename: treename,
      scientificname: scientificname,
      hindiname: hindiname,
      centreoforigin: centreoforigin,
      geographicaldistribution: geographicaldistribution,
      iucnstatus: iucnstatus,
      totalnddbcampus: totalnddbcampus || 0,
      qrcode: qrcode || null,
      link: link,
      botanyid: botanyid,
      campusid: campusid,
    };

    // Insert the species record
    const result = await db.query(
      `
      INSERT INTO species (
        treename, scientificname, hindiname, centreoforigin, 
        geographicaldistribution, iucnstatus, totalnddbcampus, 
        qrcode, link, botanyid, campusid
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `,
      [
        userData.treename,
        userData.scientificname,
        userData.hindiname,
        userData.centreoforigin,
        userData.geographicaldistribution,
        userData.iucnstatus,
        userData.totalnddbcampus,
        userData.qrcode,
        userData.link,
        userData.botanyid,
        userData.campusid,
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
      treename,
      scientificname,
      hindiname,
      centreoforigin,
      geographicaldistribution,
      iucnstatus,
      totalnddbcampus,
      qrcode,
      link,
      isactive,
      botanyid,
      campusid,
    } = req.body;

    // Build update fields and values
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (treename !== undefined) {
      fields.push(`treename = $${paramCount++}`);
      values.push(treename);
    }

    if (scientificname !== undefined) {
      fields.push(`scientificname = $${paramCount++}`);
      values.push(scientificname);
    }

    if (hindiname !== undefined) {
      fields.push(`hindiname = $${paramCount++}`);
      values.push(hindiname);
    }

    if (centreoforigin !== undefined) {
      fields.push(`centreoforigin = $${paramCount++}`);
      values.push(centreoforigin);
    }

    if (geographicaldistribution !== undefined) {
      fields.push(`geographicaldistribution = $${paramCount++}`);
      values.push(geographicaldistribution);
    }

    if (iucnstatus !== undefined) {
      fields.push(`iucnstatus = $${paramCount++}`);
      values.push(iucnstatus);
    }

    if (totalnddbcampus !== undefined) {
      fields.push(`totalnddbcampus = $${paramCount++}`);
      values.push(totalnddbcampus);
    }

    if (qrcode !== undefined) {
      fields.push(`qrcode = $${paramCount++}`);
      values.push(qrcode);
    }

    if (link !== undefined) {
      fields.push(`Link = $${paramCount++}`);
      values.push(link);
    }

    if (isactive !== undefined) {
      fields.push(`isactive = $${paramCount++}`);
      values.push(isactive);
    }

    if (botanyid !== undefined) {
      fields.push(`botanyid = $${paramCount++}`);
      values.push(botanyid);
    }

    if (campusid !== undefined) {
      fields.push(`campusid = $${paramCount++}`);
      values.push(campusid);
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

exports.getSpeciesIDandName = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT id,treename from species ORDER BY id ASC;
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
