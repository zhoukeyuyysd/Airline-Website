const express = require('express');
const router = express.Router();
const locationModel = require('../models/locationModel');
const ticketTypeModel = require('../models/ticketTypeModel');
const flightModel = require('../models/flightModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');

// Endpoint để lấy danh sách địa điểm
router.get('/locations', async (req, res) => {
  const locations = await locationModel.getAllLocations();
  res.json(locations);
});

// Endpoint để lấy danh sách loại vé
router.get('/ticket-types', async (req, res) => {
  const ticketTypes = await ticketTypeModel.getAllTicketTypes();
  res.json(ticketTypes);
});

// Endpoint để lấy danh sách chuyến bay
router.get('/flights', async (req, res) => {
  const flights = await flightModel.getAllFlights();
  res.json(flights);
});

// Endpoint để lấy danh sách người dùng
// Route để lấy tất cả người dùng
router.get('/users', async (req, res) => {
    try {
      const users = await getAllUsers();  // Gọi hàm getAllUsers từ model
      res.json({ data: users });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving users' });
    }
  });
  
  // Route để tạo người dùng mới
  router.post('/users', async (req, res) => {
    try {
      const newUser = await createUser(req.body);  // Gửi thông tin người dùng từ request body
      res.status(201).json({ data: newUser });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user' });
    }
  });

// Endpoint để lấy danh sách đơn hàng
router.get('/orders', async (req, res) => {
  const orders = await orderModel.getAllOrders();
  res.json(orders);
});

module.exports = router;
