const { connectDB } = require('../config/db');
const bcrypt = require('bcryptjs');


// Hàm lấy tất cả người dùng
async function getAllUsers() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM users');

  if (rows.length === 1) {
    return rows[0];  // Nếu chỉ có 1 người dùng, trả về đối tượng người dùng
  } else if (rows.length > 1) {
    const usersObj = {};
    rows.forEach(user => {
      usersObj[user.id] = user;  // Sử dụng ID người dùng làm key
    });
    return usersObj;  // Trả về object với mỗi người dùng là key
  } else {
    return {};  // Nếu không có người dùng nào, trả về object rỗng
  }
}

// Hàm tạo mới người dùng
async function createUser(userData) {
    const connection = await connectDB();
    const { username, password, email, full_name } = userData;
  
    const result = await connection.query(
      'INSERT INTO users (username, password, email, full_name) VALUES (?, ?, ?, ?)',
      [username, password, email, full_name]
    );
  
    return result[0]; // Trả về kết quả chèn dữ liệu
  }
  
  // Hàm tạo tài khoản admin mặc định nếu chưa có tài khoản admin00
    async function createDefaultAdmin() {
    const connection = await connectDB();
  
    // Kiểm tra xem có tài khoản 'admin00' trong bảng users không
    const user = await getOneUserByName('admin00');
    
    if (!user) {
      // Nếu không có tài khoản admin00, tạo tài khoản mới
      const hashedPassword = await bcrypt.hash('adminpassword', 10);  // Mật khẩu mặc định cho admin
      
      const userData = {
        username: 'admin00',
        password: hashedPassword,
        email: 'admin00@example.com',
        full_name: 'Admin User',
        role: 'admin'
      };
  
      const newUser = await createUser(userData);
      console.log('Tạo tài khoản admin00 thành công');
    } else {
      console.log('Tài khoản admin00 đã tồn tại');
    }
  }

  // Hàm lấy người dùng theo tên đăng nhập
  async function getOneUserByName(username) {
    const connection = await connectDB();
    const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
  
    if (rows.length === 0) {
      return null;  // Không tìm thấy người dùng
    }
  
    return rows[0];  // Trả về người dùng đầu tiên (vì username là duy nhất)
  }
  
  // Hàm lấy người dùng theo ID
  async function getOneUserById(id) {
    const connection = await connectDB();
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
  
    if (rows.length === 0) {
      return null;  // Không tìm thấy người dùng
    }
  
    return rows[0];  // Trả về người dùng có ID tìm thấy
  }
  
  module.exports = { getAllUsers, createUser, createDefaultAdmin, getOneUserByName, getOneUserById };


