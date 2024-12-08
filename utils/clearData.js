const { connectDB } = require('../config/db');

async function clearData() {
  try {
    const connection = await connectDB();

    // Xóa dữ liệu từ các bảng
    await connection.query('DELETE FROM order_details');
    await connection.query('DELETE FROM orders');
    await connection.query('DELETE FROM prices');
    await connection.query('DELETE FROM flights');
    await connection.query('DELETE FROM ticket_types');
    await connection.query('DELETE FROM locations');
    await connection.query('DELETE FROM users');

    console.log('Data cleared successfully!');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

module.exports = { clearData };
