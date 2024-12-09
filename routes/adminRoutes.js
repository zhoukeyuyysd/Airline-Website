const express = require('express');
const router = express.Router();
const { createPromotion } = require('../models/promotionModel'); 



// Route xử lý đăng bài khuyến mãi
router.post('/promotions', async (req, res) => {
  const { title, description, start_date, end_date } = req.body;

  if (!title || !description || !start_date || !end_date) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }

  try {
    // Gọi hàm tạo khuyến mãi
    await createPromotion({ title, description, start_date, end_date });

    // Redirect về trang khuyến mãi hoặc thông báo thành công
    res.status(201).send('Khuyến mãi đã được đăng thành công');
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng khuyến mãi', error: error.message });
  }
});

module.exports = router;
