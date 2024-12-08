const { connectDB } = require('../config/db');

async function getAllLocations() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM locations');
  return rows;
}

module.exports = { getAllLocations };
