const db = require("../config/db");

// Get all birds (simplified to focus on Birds table)
const getAllBirds = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
          b.*,
          bt.Type AS bird_type_name
      FROM 
          Birds b
      LEFT JOIN 
          birds_type bt ON b.birds_type = bt.Id
  `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching birds:", error);
    res.status(500).json({ error: "Failed to fetch birds" });
  }
};

// Get a specific bird by ID (without joining BirdTypes)
const getBirdById = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query("SELECT * FROM Birds WHERE Id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching bird:", error);
    res.status(500).json({ error: "Failed to fetch bird" });
  }
};

// Create a new bird
const createBird = async (req, res) => {
  const {
    birdname,
    scientificname,
    birds_type,
    iucnstatus,
    migrationstatus,
    foodpreference,
    habitatpreference,
    globaldistribution,
    ecologicalrole,
    birdimage,
    urllink,
    coordinates,
    isactive,
    qrcode,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO Birds (
        BirdName, ScientificName, birds_type, IUCNStatus, MigrationStatus, 
        FoodPreference, HabitatPreference, GlobalDistribution, EcologicalRole, 
        BirdImage, URLLink, Coordinates, IsActive, QRCode
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        birdname,
        scientificname,
        birds_type,
        iucnstatus,
        migrationstatus,
        foodpreference,
        habitatpreference,
        globaldistribution,
        ecologicalrole,
        birdimage,
        urllink,
        coordinates,
        isactive ?? true,
        qrcode,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating bird:", error);
    res.status(500).json({ error: "Failed to create bird" });
  }
};

// Update a bird
const updateBird = async (req, res) => {
  const id = req.params.id;
  const {
    birdname,
    scientificname,
    birds_type,
    iucnstatus,
    migrationstatus,
    foodpreference,
    habitatpreference,
    globaldistribution,
    ecologicalrole,
    birdimage,
    urllink,
    coordinates,
    isactive,
    qrcode,
  } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM Birds WHERE Id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    const result = await db.query(
      `UPDATE Birds SET 
        BirdName = $1, 
        ScientificName = $2, 
        birds_type = $3, 
        IUCNStatus = $4, 
        MigrationStatus = $5,
        FoodPreference = $6, 
        HabitatPreference = $7, 
        GlobalDistribution = $8, 
        EcologicalRole = $9,
        BirdImage = $10, 
        URLLink = $11, 
        Coordinates = $12, 
        IsActive = $13, 
        QRCode = $14
      WHERE Id = $15 RETURNING *`,
      [
        birdname,
        scientificname,
        birds_type,
        iucnstatus,
        migrationstatus,
        foodpreference,
        habitatpreference,
        globaldistribution,
        ecologicalrole,
        birdimage,
        urllink,
        coordinates,
        isactive,
        qrcode,
        id,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating bird:", error);
    res.status(500).json({ error: "Failed to update bird" });
  }
};

// Delete a bird
const deleteBird = async (req, res) => {
  const id = req.params.id;

  try {
    const checkResult = await db.query("SELECT * FROM Birds WHERE Id = $1", [
      id,
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Bird not found" });
    }

    await db.query("DELETE FROM Birds WHERE Id = $1", [id]);
    res.status(200).json({ message: "Bird deleted successfully" });
  } catch (error) {
    console.error("Error deleting bird:", error);
    res.status(500).json({ error: "Failed to delete bird" });
  }
};

// Get birds by type
const getBirdsByType = async (req, res) => {
  const typeid = req.params.typeid;

  try {
    const result = await db.query(
      "SELECT * FROM Birds WHERE birds_type = $1 ORDER BY BirdName",
      [typeid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching birds by type:", error);
    res.status(500).json({ error: "Failed to fetch birds by type" });
  }
};

module.exports = {
  getAllBirds,
  getBirdById,
  createBird,
  updateBird,
  deleteBird,
  getBirdsByType,
};
