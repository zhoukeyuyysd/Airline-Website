const { connectDB } = require('../config/db');

async function createPromotion(promotionData) {
  const connection = await connectDB();
  const { title, description, start_date, end_date } = promotionData;

  const result = await connection.query(
    'INSERT INTO promotions (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
    [title, description, start_date, end_date]
  );

  return result[0]; // Trả về kết quả chèn dữ liệu
}

module.exports = { createPromotion };
