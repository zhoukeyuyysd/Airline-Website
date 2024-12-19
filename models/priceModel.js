const { connectDB } = require('../config/db');

// Hàm lấy tất cả giá vé
async function getAllPrices() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM prices');  

  if (rows.length === 1) {
    return rows[0];  // Trả về giá nếu chỉ có một
  } else if (rows.length > 1) {
    const pricesObj = {};  
    rows.forEach(price => {
      pricesObj[price.id] = price;  // Tạo đối tượng với id làm khóa
    });
    return pricesObj;  // Trả về tất cả giá vé
  } else {
    return {};  // Nếu không có giá nào, trả về đối tượng rỗng
  }
}

// Hàm lấy giá vé theo ID
async function getPriceById(id) {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM prices WHERE id = ?', [id]);

  if (rows.length === 1) {
    return rows[0];  // Trả về giá nếu tìm thấy
  } else {
    return null;  // Không tìm thấy giá
  }
}

// Hàm thêm một giá vé mới
async function createPrice(priceData) {
  const connection = await connectDB();
  const { flight_id, ticket_type_id, price } = priceData;

  const result = await connection.query(
    'INSERT INTO prices (flight_id, ticket_type_id, price) VALUES (?, ?, ?)',
    [flight_id, ticket_type_id, price]
  );

  return result[0];  // Trả về kết quả chèn dữ liệu
}

// Hàm cập nhật giá vé
async function updatePrice(id, priceData) {
  const connection = await connectDB();
  const { flight_id, ticket_type_id, price } = priceData;

  const result = await connection.query(
    'UPDATE prices SET flight_id = ?, ticket_type_id = ?, price = ? WHERE id = ?',
    [flight_id, ticket_type_id, price, id]
  );

  if (result.affectedRows === 1) {
    return { message: 'Cập nhật giá vé thành công' };
  } else {
    return { message: 'Không tìm thấy giá vé để cập nhật' };
  }
}

// Hàm xóa giá vé
async function deletePrice(id) {
  const connection = await connectDB();
  const result = await connection.query('DELETE FROM prices WHERE id = ?', [id]);

  if (result.affectedRows === 1) {
    return { message: 'Xóa giá vé thành công' };
  } else {
    return { message: 'Không tìm thấy giá vé để xóa' };
  }
}
// Hàm lấy giá vé theo flight_id và ticket_type_id
async function getPriceByFlightAndTicketType(flightId, ticketTypeId) {
    const connection = await connectDB();
    const [rows] = await connection.query(
      'SELECT * FROM prices WHERE flight_id = ? AND ticket_type_id = ?',
      [flightId, ticketTypeId]
    );
    if (rows.length === 1) {
      return rows[0].price;
    }
    return 0;
  }

  // Hàm cập nhật giá vé theo flight_id và ticket_type_id
async function updatePriceByFlightAndTicketType(flightId, ticketTypeId, newPrice) {
  const connection = await connectDB();

  // Kiểm tra xem có giá vé tồn tại cho flight_id và ticket_type_id không
  const [rows] = await connection.query(
    'SELECT * FROM prices WHERE flight_id = ? AND ticket_type_id = ?',
    [flightId, ticketTypeId]
  );

  // Nếu không có bản ghi, thêm mới giá vé
  if (rows.length === 0) {
    const result = await connection.query(
      'INSERT INTO prices (flight_id, ticket_type_id, price) VALUES (?, ?, ?)',
      [flightId, ticketTypeId, newPrice]
    );
    return result[0];  // Trả về kết quả sau khi thêm mới
  } else {
    // Nếu có bản ghi, cập nhật giá vé
    const result = await connection.query(
      'UPDATE prices SET price = ? WHERE flight_id = ? AND ticket_type_id = ?',
      [newPrice, flightId, ticketTypeId]
    );
    return result[0];  // Trả về kết quả cập nhật
  }
}

module.exports = {
  getAllPrices,
  getPriceById,
  createPrice,
  updatePrice,
  deletePrice,
  getPriceByFlightAndTicketType ,
  updatePriceByFlightAndTicketType,

};
