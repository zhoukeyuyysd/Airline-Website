const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/db');  // Kết nối cơ sở dữ liệu

// Đọc dữ liệu từ tệp JSON
const loadDataFromFile = (filePath) => {
  try {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Lỗi khi đọc tệp JSON:", error);
    return null;
  }
};

async function loadData() {
  const connection = await connectDB();  // Kết nối đến cơ sở dữ liệu

  try {
    // Đọc dữ liệu từ tệp data.json
    const data = loadDataFromFile(path.join(__dirname, 'data.json'));

    if (!data) {
      console.error('Không có dữ liệu để tải.');
      return;
    }

    // Chèn dữ liệu vào bảng locations
    for (const location of data.locations) {
      const insertLocationQuery = 'INSERT INTO locations (name, description) VALUES (?, ?)';
      await connection.query(insertLocationQuery, [location.name, location.description]);
      console.log(`Đã chèn location: ${location.name}`);
    }

    // Chèn dữ liệu vào bảng ticket_types
    for (const ticketType of data.ticket_types) {
      const insertTicketTypeQuery = 'INSERT INTO ticket_types (name, description, category, trip_type, airline) VALUES (?, ?, ?, ?, ?)';
      await connection.query(insertTicketTypeQuery, [ticketType.name, ticketType.description, ticketType.category, ticketType.trip_type, ticketType.airline]);
      console.log(`Đã chèn ticket type: ${ticketType.name}`);
    }

    // Chèn dữ liệu vào bảng airplanes
    for (const airplane of data.airplanes) {
      const insertAirplaneQuery = 'INSERT INTO airplanes (airplane_code, manufacturer, model, seat_count, description) VALUES (?, ?, ?, ?, ?)';
      await connection.query(insertAirplaneQuery, [airplane.airplane_code, airplane.manufacturer, airplane.model, airplane.seat_count, airplane.description]);
      console.log(`Đã chèn airplane: ${airplane.airplane_code}`);
    }

    // Chèn dữ liệu vào bảng flights
    for (const flight of data.flights) {
      const insertFlightQuery = 'INSERT INTO flights (flight_code, departure_location_id, arrival_location_id, departure_time, arrival_time, airline, status, airplane_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      await connection.query(insertFlightQuery, [flight.flight_code, flight.departure_location_id, flight.arrival_location_id, flight.departure_time, flight.arrival_time, flight.airline, flight.status, flight.airplane_id]);
      console.log(`Đã chèn flight: ${flight.flight_code}`);
    }

    // Chèn dữ liệu vào bảng prices
    for (const price of data.prices) {
      const insertPriceQuery = 'INSERT INTO prices (flight_id, ticket_type_id, price) VALUES (?, ?, ?)';
      await connection.query(insertPriceQuery, [price.flight_id, price.ticket_type_id, price.price]);
      console.log(`Đã chèn price cho flight_id: ${price.flight_id}`);
    }

    // Chèn dữ liệu vào bảng users
    for (const user of data.users) {
      const insertUserQuery = 'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)';
      await connection.query(insertUserQuery, [user.username, user.password, user.email, user.full_name, user.role]);
      console.log(`Đã chèn người dùng: ${user.username}`);
    }

    // Chèn dữ liệu vào bảng orders
    for (const order of data.orders) {
      const insertOrderQuery = 'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)';
      await connection.query(insertOrderQuery, [order.user_id, order.total_price, order.status]);
      console.log(`Đã chèn đơn hàng với user_id: ${order.user_id}`);
    }

    // Chèn dữ liệu vào bảng order_details
    for (const orderDetail of data.order_details) {
      const insertOrderDetailQuery = 'INSERT INTO order_details (order_id, flight_id, ticket_type_id, quantity, price_id) VALUES (?, ?, ?, ?, ?)';
      await connection.query(insertOrderDetailQuery, [orderDetail.order_id, orderDetail.flight_id, orderDetail.ticket_type_id, orderDetail.quantity, orderDetail.price_id]);
      console.log(`Đã chèn order detail cho order_id: ${orderDetail.order_id}`);
    }

    // Chèn dữ liệu vào bảng vouchers
    for (const voucher of data.vouchers) {
      const insertVoucherQuery = 'INSERT INTO vouchers (code, discount, expiration_date, status) VALUES (?, ?, ?, ?)';
      await connection.query(insertVoucherQuery, [voucher.code, voucher.discount, voucher.expiration_date, voucher.status]);
      console.log(`Đã chèn voucher: ${voucher.code}`);
    }

    // Chèn dữ liệu vào bảng promotions
    for (const promotion of data.promotions) {
      const insertPromotionQuery = 'INSERT INTO promotions (title, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)';
      await connection.query(insertPromotionQuery, [promotion.title, promotion.description, promotion.start_date, promotion.end_date, promotion.status]);
      console.log(`Đã chèn khuyến mãi: ${promotion.title}`);
    }

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu vào cơ sở dữ liệu:', error);
  } finally {
    connection.end();
  }
}

loadData();
