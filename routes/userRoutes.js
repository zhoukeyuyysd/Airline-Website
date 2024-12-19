const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { createUser, getOneUserByName } = require('../models/userModel'); 
const { getAllPromotions } = require('../models/promotionModel');
const { getPriceByFlightAndTicketType } = require('../models/priceModel'); 
const { createOrder } = require('../models/orderModel');  // Model tạo đơn hàng
const { getVoucherByCode } = require('../models/voucherModel');


// Middleware kiểm tra dữ liệu đầu vào cho đăng ký
function validateRegisterData(req, res, next) {
  const { username, password, email, full_name } = req.body;
  
  if (!username || !password || !email || !full_name) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  next();
}

// Route đăng ký người dùng
router.post('/register', validateRegisterData, async (req, res) => {
  try {
    const { username, password, email, full_name } = req.body;

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await getOneUserByName(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      username,
      password: hashedPassword,
      email,
      full_name
    };

    // Tạo người dùng mới
    const newUser = await createUser(userData);

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Middleware kiểm tra đăng nhập
async function authenticateUser(req, res, next) {
  const { username, password } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
  }

  // Kiểm tra tên đăng nhập trong cơ sở dữ liệu
  const user = await getOneUserByName(username);
  if (!user) {
    return res.status(401).json({ message: 'Tên đăng nhập không đúng' });
  }

  // Kiểm tra mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Mật khẩu không đúng' });
  }

  // Lưu thông tin người dùng vào session
  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  next();
}

// Route đăng nhập người dùng
router.post('/login', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Đăng nhập thành công', user: req.session.user });
});

// API route to get the current session (logged-in user)
router.get('/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });  // Not logged in
  }

  // If logged in, return session data (user information)
  res.status(200).json({
    id: req.session.user.id,
    username: req.session.user.username,
    role: req.session.user.role
  });
});

//API lấy locations


// API để lấy tất cả các khuyến mãi
router.get('/promotions', async (req, res) => {
  try {
    const promotions = await getAllPromotions();  // Lấy tất cả các khuyến mãi
    res.status(200).json(promotions);  // Trả về kết quả dưới dạng JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách khuyến mãi.' });
  }
});

// API thêm item vào giỏ hàng
router.post('/cart', async (req, res) => {
  const { flightId, ticketTypeId, quantity } = req.body;
  const userId = req.session.user.id;  // Lấy thông tin người dùng từ session

  if (!flightId || !ticketTypeId || !quantity) {
    return res.status(400).json({ message: 'Thiếu thông tin chuyến bay, loại vé hoặc số lượng.' });
  }

  // Lấy giá vé từ bảng prices
  const price = await getPriceByFlightAndTicketType(flightId, ticketTypeId);

  if (!price) {
    return res.status(400).json({ message: 'Không tìm thấy giá vé cho chuyến bay và loại vé này.' });
  }

  // Thêm item vào giỏ hàng trong session
  if (!req.session.cart) {
    req.session.cart = [];  // Nếu chưa có giỏ hàng, tạo mới
  }

  // Kiểm tra nếu item đã có trong giỏ hàng, chỉ cập nhật số lượng
  const existingItemIndex = req.session.cart.findIndex(item => 
    item.flightId === flightId && item.ticketTypeId === ticketTypeId
  );

  if (existingItemIndex !== -1) {
    req.session.cart[existingItemIndex].quantity += quantity;  // Cập nhật số lượng
  } else {
    // Nếu item chưa có trong giỏ, thêm mới
    req.session.cart.push({
      flightId,
      ticketTypeId,
      quantity,
      price,
      total: price * quantity  // Tính tổng cho item
    });
  }

  res.status(200).json({
    message: 'Item đã được thêm vào giỏ hàng.',
    cart: req.session.cart
  });
});
//
// API lấy giỏ hàng của người dùng
router.get('/cart', (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.status(404).json({ message: 'Giỏ hàng của bạn hiện tại trống.' });
  }

  res.status(200).json({
    cart: req.session.cart
  });
});
// API xóa item khỏi giỏ hàng
router.delete('/cart', (req, res) => {
  const { flightId, ticketTypeId } = req.body;

  if (!flightId || !ticketTypeId) {
    return res.status(400).json({ message: 'Thiếu thông tin chuyến bay và loại vé để xóa.' });
  }

  // Tìm và xóa item khỏi giỏ hàng
  req.session.cart = req.session.cart.filter(item =>
    item.flightId !== flightId || item.ticketTypeId !== ticketTypeId
  );

  res.status(200).json({
    message: 'Item đã được xóa khỏi giỏ hàng.',
    cart: req.session.cart
  });
});

// API thanh toán và tạo đơn hàng
router.post('/checkout', async (req, res) => {
  const userId = req.session.user.id;  // Lấy ID người dùng từ session
  const cart = req.session.cart;  // Giỏ hàng từ session

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng trống. Vui lòng thêm vé vào giỏ hàng.' });
  }

  // Tính tổng giá trị đơn hàng
  let totalPrice = 0;
  const orderDetails = [];

  for (const item of cart) {
    const price = await getPriceByFlightAndTicketType(item.flightId, item.ticketTypeId);
    if (!price) {
      return res.status(400).json({ message: `Không tìm thấy giá vé cho chuyến bay ${item.flightId} và loại vé ${item.ticketTypeId}.` });
    }
    totalPrice += price.price * item.quantity;  // Tính tổng giá trị đơn hàng
    orderDetails.push({
      flightId: item.flightId,
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity,
      priceId: price.id
    });
  }

  // Áp dụng voucher nếu có
  const voucherCode = req.body.voucherCode || '';  // Lấy voucher từ request body
  let finalPrice = totalPrice;

  if (voucherCode) {
    const voucher = await getVoucherByCode(voucherCode);
    if (voucher) {
      finalPrice = totalPrice * (1 - voucher.discount / 100);  // Giảm giá theo voucher
    } else {
      return res.status(400).json({ message: 'Voucher không hợp lệ hoặc đã hết hạn.' });
    }
  }

  try {
    // Tạo đơn hàng và chi tiết đơn hàng
    const order = await createOrder(userId, finalPrice, orderDetails, voucherCode);  // Tạo đơn hàng

    // Xóa giỏ hàng sau khi thanh toán thành công
    req.session.cart = [];

    res.status(201).json({
      message: 'Thanh toán thành công, đơn hàng đã được tạo.',
      order: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng: ' + error.message });
  }
});





// Route đăng xuất
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Lỗi khi đăng xuất');
    }
    res.status(200).send('Đăng xuất thành công');
  });
});

module.exports = router;

