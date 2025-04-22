const db = require("../config/db");

// Get all bird types
const getAllBirdTypes = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM birds_type");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching bird types:", error);
    res.status(500).json({ error: "Failed to fetch bird types" });
  }
};

// Get a specific bird type by ID
const getBirdTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM birds_type WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird type not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching bird type:", error);
    res.status(500).json({ error: "Failed to fetch bird type" });
  }
};

// Create a new bird type
const createBirdType = async (req, res) => {
  const { type, hindi } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Type is required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO birds_type (type, hindi) VALUES ($1, $2) RETURNING *",
      [type, hindi]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating bird type:", error);
    res.status(500).json({ error: "Failed to create bird type" });
  }
};

// Update a bird type
const updateBirdType = async (req, res) => {
  const { id } = req.params;
  const { type, hindi } = req.body;

  if (!type) {
    return res.status(400).json({ error: "Type is required" });
  }

  try {
    const result = await db.query(
      "UPDATE birds_type SET type = $1, hindi = $2 WHERE id = $3 RETURNING *",
      [type, hindi, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird type not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating bird type:", error);
    res.status(500).json({ error: "Failed to update bird type" });
  }
};

const deleteBirdType = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if any birds are using this type
    const birdCheck = await db.query(
      "SELECT COUNT(*) FROM birds WHERE birds_type = $1", // <- make sure this column name is correct
      [id]
    );

    if (parseInt(birdCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error:
          "Cannot delete bird type that is being used by birds. Update those birds first.",
      });
    }

    // Use RETURNING * to get the deleted row
    const result = await db.query(
      "DELETE FROM birds_type WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bird type not found" });
    }

    res.status(200).json({ message: "Bird type deleted successfully" });
  } catch (error) {
    console.error("Error deleting bird type:", error);
    res.status(500).json({ error: "Failed to delete bird type" });
  }
};

module.exports = {
  getAllBirdTypes,
  getBirdTypeById,
  createBirdType,
  updateBirdType,
  deleteBirdType,
};
