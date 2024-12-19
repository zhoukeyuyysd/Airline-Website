const express = require('express');
const router = express.Router();
const { createPromotion } = require('../models/promotionModel'); 
const locationModel = require('../models/locationModel'); 
const airplaneModel = require('../models/airplaneModel');
const { createPrice, updatePrice, updatePriceByFlightAndTicketType} = require('../models/priceModel');
const orderModel = require('../models/orderModel');  // Import model



//Prices
router.post('/prices', async (req, res) => {
  const priceData = req.body;

  try {
    const result = await createPrice(priceData);
    res.status(201).json({ message: 'Thêm giá vé thành công', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi thêm giá vé.' });
  }
});

router.put('/prices/:id', async (req, res) => {
  const { id } = req.params;
  const priceData = req.body;

  try {
    const result = await updatePrice(id, priceData);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật giá vé.' });
  }
});

// API cập nhật giá vé
router.put('/prices/:flightId/:ticketTypeId', async (req, res) => {
  const { flightId, ticketTypeId } = req.params;
  const { newPrice } = req.body;

  if (!newPrice) {
    return res.status(400).json({ message: 'Bạn phải cung cấp giá mới' });
  }

  try {
    // Cập nhật giá vé theo flightId và ticketTypeId
    const result = await updatePriceByFlightAndTicketType(flightId, ticketTypeId, newPrice);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giá vé để cập nhật' });
    }

    res.status(200).json({ message: 'Cập nhật giá vé thành công', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật giá vé' });
  }
});


// API để tạo một máy bay mới
router.post('/airplanes', async (req, res) => {
  const airplaneData = req.body;
  try {
    const result = await airplaneModel.createAirplane(airplaneData); // Tạo máy bay mới
    res.status(201).json({ message: 'Máy bay được tạo thành công', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo máy bay.' });
  }
});

// API để cập nhật máy bay
router.put('/airplanes/:id', async (req, res) => {
  const { id } = req.params;
  const airplaneData = req.body;
  try {
    const result = await airplaneModel.updateAirplane(id, airplaneData); // Cập nhật máy bay theo ID
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Cập nhật máy bay thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy máy bay để cập nhật' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật máy bay.' });
  }
});

// API để xóa máy bay
router.delete('/airplanes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await airplaneModel.deleteAirplane(id); // Xóa máy bay theo ID
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Xóa máy bay thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy máy bay để xóa' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa máy bay.' });
  }
});


// API to add a new location
router.post('/locations', async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }

  try {
    const newLocation = await locationModel.createLocation({ name, description });
    res.status(201).json({ message: 'Location added successfully.', location: newLocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding location.' });
  }
});

// API to update a location by ID
router.put('/locations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required.' });
  }

  try {
    const updatedLocation = await locationModel.updateLocation(id, { name, description });
    if (updatedLocation.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found.' });
    }
    res.status(200).json({ message: 'Location updated successfully.', location: { id, name, description } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating location.' });
  }
});

// API to delete a location by ID
router.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await locationModel.deleteLocation(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Location not found.' });
    }
    res.status(200).json({ message: 'Location deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting location.' });
  }
});


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

//Route admin orders
// API để lấy tất cả các đơn hàng của khách hàng và chi tiết
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await orderModel.getAllOrders();  // Lấy tất cả các đơn hàng và chi tiết
    res.status(200).json(orders);  // Trả về kết quả dưới dạng JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng.' });
  }
});



module.exports = router;
