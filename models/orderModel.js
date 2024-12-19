// models/orderModel.js
const { connectDB } = require('../config/db');

// Tạo đơn hàng và lưu chi tiết đơn hàng
async function createOrder(userId, totalPrice, orderDetails, voucherCode) {
  const connection = await connectDB();

  // Kiểm tra voucher nếu có
  let voucherId = null;
  if (voucherCode) {
    const [voucher] = await connection.query(
      'SELECT * FROM vouchers WHERE code = ? AND status = "Active" AND expiration_date > NOW()',
      [voucherCode]
    );
    if (voucher.length > 0) {
      voucherId = voucher[0].id;
      totalPrice *= (1 - voucher[0].discount / 100);  // Áp dụng giảm giá từ voucher
    }
  }

  // Tạo đơn hàng
  const result = await connection.query(
    'INSERT INTO orders (user_id, total_price, status, voucher_id) VALUES (?, ?, "Pending", ?)',
    [userId, totalPrice, voucherId]
  );

  const orderId = result[0].insertId;

  // Thêm chi tiết đơn hàng vào bảng order_details
  for (const item of orderDetails) {
    await connection.query(
      'INSERT INTO order_details (order_id, flight_id, ticket_type_id, quantity, price_id) VALUES (?, ?, ?, ?, ?)',
      [orderId, item.flightId, item.ticketTypeId, item.quantity, item.priceId]
    );
  }

  return { orderId, totalPrice, orderDetails };
}

// Hàm lấy tất cả đơn hàng và chi tiết đơn hàng
async function getAllOrders() {
  const connection = await connectDB();

  // Truy vấn tất cả các đơn hàng và kết hợp với các chi tiết đơn hàng
  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.total_price,
      o.order_date,
      o.status AS order_status,
      o.voucher_id,
      od.id AS order_detail_id,
      od.flight_id,
      od.ticket_type_id,
      od.quantity,
      od.price_id,
      f.flight_code,
      f.departure_time,
      f.arrival_time,
      t.name AS ticket_type_name,
      p.price
    FROM orders o
    LEFT JOIN order_details od ON o.id = od.order_id
    LEFT JOIN flights f ON od.flight_id = f.id
    LEFT JOIN ticket_types t ON od.ticket_type_id = t.id
    LEFT JOIN prices p ON od.price_id = p.id
    ORDER BY o.order_date DESC
  `;

  const [rows] = await connection.query(query);

  // Tổ chức dữ liệu theo order_id và trả về kết quả
  const orders = rows.reduce((acc, row) => {
    if (!acc[row.order_id]) {
      acc[row.order_id] = {
        order_id: row.order_id,
        user_id: row.user_id,
        total_price: row.total_price,
        order_date: row.order_date,
        order_status: row.order_status,
        voucher_id: row.voucher_id,
        order_details: []
      };
    }

    acc[row.order_id].order_details.push({
      order_detail_id: row.order_detail_id,
      flight_id: row.flight_id,
      ticket_type_id: row.ticket_type_id,
      quantity: row.quantity,
      price_id: row.price_id,
      flight_code: row.flight_code,
      departure_time: row.departure_time,
      arrival_time: row.arrival_time,
      ticket_type_name: row.ticket_type_name,
      price: row.price
    });

    return acc;
  }, {});

  return Object.values(orders); // Trả về mảng các đơn hàng
}

module.exports = { createOrder, getAllOrders };
