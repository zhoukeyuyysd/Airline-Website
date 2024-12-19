const { connectDB } = require('../config/db');

// Hàm lấy tất cả địa điểm
async function getAllLocations() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM locations');  

  if (rows.length === 1) {
    return rows[0];  
  } else if (rows.length > 1) {
    const locationsObj = {};  
    rows.forEach(location => {
      locationsObj[location.id] = location; 
    });
    return locationsObj; 
  } else {
    return {};  // Nếu không có địa điểm nào, trả về đối tượng rỗng
  }
}

// Hàm thêm một địa điểm mới
async function createLocation(locationData) {
  const connection = await connectDB();
  const { name, description } = locationData;

  const result = await connection.query(
    'INSERT INTO locations (name, description) VALUES (?, ?)',
    [name, description]
  );

  return result[0]; // Trả về kết quả chèn dữ liệu
}

// Hàm lấy một địa điểm theo ID
async function getLocationById(id) {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);

  if (rows.length === 1) {
    return rows[0];  // Trả về địa điểm nếu tìm thấy
  } else {
    return null;  // Không tìm thấy địa điểm
  }
}

// Hàm cập nhật địa điểm
async function updateLocation(id, locationData) {
  const connection = await connectDB();
  const { name, description } = locationData;

  const result = await connection.query(
    'UPDATE locations SET name = ?, description = ? WHERE id = ?',
    [name, description, id]
  );

  return result[0]; // Trả về kết quả cập nhật dữ liệu
}

// Hàm xóa địa điểm
async function deleteLocation(id) {
  const connection = await connectDB();
  const result = await connection.query('DELETE FROM locations WHERE id = ?', [id]);

  return result[0]; // Trả về kết quả xóa dữ liệu
}

module.exports = {
  getAllLocations,
  createLocation,
  getLocationById,
  updateLocation,
  deleteLocation,
};

