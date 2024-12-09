const { connectDB } = require('../config/db');  

async function clearData() {
  try {
    const connection = await connectDB();

    // Tắt kiểm tra khóa ngoại trước khi xóa dữ liệu để tránh lỗi khóa ngoại
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

     // Truncate dữ liệu từ các bảng
     await connection.query('TRUNCATE TABLE order_details');
     await connection.query('TRUNCATE TABLE orders');
     await connection.query('TRUNCATE TABLE prices');
     await connection.query('TRUNCATE TABLE flights');
     await connection.query('TRUNCATE TABLE ticket_types');
     await connection.query('TRUNCATE TABLE locations');
     await connection.query('TRUNCATE TABLE airplanes');
     await connection.query('TRUNCATE TABLE users');
     await connection.query('TRUNCATE TABLE vouchers');
     await connection.query('TRUNCATE TABLE promotions'); 

    // Bật lại kiểm tra khóa ngoại sau khi xóa
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Data cleared successfully!');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// Xuất hàm clearData
module.exports = { clearData };
