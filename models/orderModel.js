const { connectDB } = require('../config/db');

async function getAllOrders() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM orders');
  return rows;
}

module.exports = { getAllOrders };
