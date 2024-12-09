const { connectDB } = require('../config/db');

//Lấy tất cả promotions để hiển thị

async function getAllPromotions() {
  const connection = await connectDB();  
  const [rows] = await connection.query('SELECT * FROM promotions');  

  if (rows.length === 1) {
    return rows[0];  
  } else if (rows.length > 1) {
    const promotionsObj = {};  
    rows.forEach(promotion => {
      promotionsObj[promotion.id] = promotion; 
    });
    return promotionsObj; 
  } else {
    return {};  // Nếu không có khuyến mãi nào, trả về đối tượng rỗng
  }
}

//Tạo Promotions

async function createPromotion(promotionData) {
  const connection = await connectDB();
  const { title, description, start_date, end_date } = promotionData;

  const result = await connection.query(
    'INSERT INTO promotions (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
    [title, description, start_date, end_date]
  );

  return result[0]; // Trả về kết quả chèn dữ liệu
}

module.exports = { getAllPromotions, createPromotion };
