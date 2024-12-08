const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/db');

async function loadData() {
  try {
    const connection = await connectDB();

    // Đọc file JSON
    const rawData = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf-8');
    const data = JSON.parse(rawData);

    // Tải dữ liệu vào bảng Locations
    for (const location of data.locations) {
      await connection.query('INSERT INTO locations (name, description) VALUES (?, ?)', [location.name, location.description]);
    }

    // Tải dữ liệu vào bảng Ticket Types
    for (const ticketType of data.ticket_types) {
      await connection.query('INSERT INTO ticket_types (name, description, category, trip_type, airline) VALUES (?, ?, ?, ?, ?)', 
        [ticketType.name, ticketType.description, ticketType.category, ticketType.trip_type, ticketType.airline]);
    }

    // Tải dữ liệu vào bảng Airplanes
    for (const airplane of data.airplanes) {
      await connection.query('INSERT INTO airplanes (airplane_code, manufacturer, model, seat_count, description) VALUES (?, ?, ?, ?, ?)', 
        [airplane.airplane_code, airplane.manufacturer, airplane.model, airplane.seat_count, airplane.description]);
    }

    // Tải dữ liệu vào bảng Flights
    for (const flight of data.flights) {
      await connection.query('INSERT INTO flights (flight_code, departure_location_id, arrival_location_id, departure_time, arrival_time, airline, status, airplane_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
        [flight.flight_code, flight.departure_location_id, flight.arrival_location_id, flight.departure_time, flight.arrival_time, flight.airline, flight.status, flight.airplane_id]);
    }

    // Tải dữ liệu vào bảng Prices
    for (const price of data.prices) {
      await connection.query('INSERT INTO prices (flight_id, ticket_type_id, price) VALUES (?, ?, ?)', 
        [price.flight_id, price.ticket_type_id, price.price]);
    }

    // Tải dữ liệu vào bảng Users
    for (const user of data.users) {
      await connection.query('INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)', 
        [user.username, user.password, user.email, user.full_name, user.role || 'customer']);
    }

    // Tải dữ liệu vào bảng Orders
    for (const order of data.orders) {
      await connection.query('INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)', 
        [order.user_id, order.total_price, order.status]);
    }

    // Tải dữ liệu vào bảng Order Details
    for (const orderDetail of data.order_details) {
      await connection.query('INSERT INTO order_details (order_id, flight_id, ticket_type_id, quantity, price_id) VALUES (?, ?, ?, ?, ?)', 
        [orderDetail.order_id, orderDetail.flight_id, orderDetail.ticket_type_id, orderDetail.quantity, orderDetail.price_id]);
    }

    // Tải dữ liệu vào bảng Vouchers
    for (const voucher of data.vouchers) {
      await connection.query('INSERT INTO vouchers (code, discount, expiration_date, status) VALUES (?, ?, ?, ?)', 
        [voucher.code, voucher.discount, voucher.expiration_date, voucher.status]);
    }

    // Tải dữ liệu vào bảng Promotions
    for (const promotion of data.promotions) {
      await connection.query('INSERT INTO promotions (title, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)', 
        [promotion.title, promotion.description, promotion.start_date, promotion.end_date, promotion.status]);
    }

    console.log('Data loaded successfully into the database.');
  } catch (error) {
    console.error('Error loading data into the database:', error);
  }
}

loadData();
