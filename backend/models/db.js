/**
 * Database model and query helper functions
 * Provides abstraction for database operations
 */
const pool = require("../config/db");

/**
 * Execute SQL query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
};

/**
 * Get all records from a table
 * @param {string} table - Table name
 * @returns {Promise} - Query result
 */
const getAll = async (table) => {
  return await query(`SELECT * FROM ${table}`);
};

/**
 * Get a record by ID
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @returns {Promise} - Query result
 */
const getById = async (table, id) => {
  return await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
};

/**
 * Insert a new record
 * @param {string} table - Table name
 * @param {Object} data - Record data
 * @returns {Promise} - Query result
 */
const insert = async (table, data) => {
  const columns = Object.keys(data).join(", ");
  const values = Object.values(data);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  return await query(sql, values);
};

/**
 * Update a record
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @param {Object} data - Updated data
 * @returns {Promise} - Query result
 */
const update = async (table, id, data) => {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const setClauses = columns
    .map((col, index) => `${col} = $${index + 1}`)
    .join(", ");
  const sql = `UPDATE ${table} SET ${setClauses} WHERE id = $${
    values.length + 1
  } RETURNING *`;

  return await query(sql, [...values, id]);
};

/**
 * Delete a record
 * @param {string} table - Table name
 * @param {number} id - Record ID
 * @returns {Promise} - Query result
 */
const remove = async (table, id) => {
  return await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
};

module.exports = {
  query,
  getAll,
  getById,
  insert,
  update,
  remove,
  pool,
};
