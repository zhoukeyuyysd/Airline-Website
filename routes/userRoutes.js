const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { createUser, getOneUserByName } = require('../models/userModel'); 
const { getAllPromotions } = require('../models/promotionModel');


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

