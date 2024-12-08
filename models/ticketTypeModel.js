const { connectDB } = require('../config/db');

async function getAllTicketTypes() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM ticket_types');
  return rows;
}

module.exports = { getAllTicketTypes };
