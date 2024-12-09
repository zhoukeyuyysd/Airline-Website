const express = require('express');
const session = require('express-session');

const app = express();
const path = require('path');
const { createDefaultAdmin } = require('./models/userModel');
const flightRoutes = require('./routes/flightRoutes');
const userRoutes = require('./routes/userRoutes');   // Thêm route người dùng
const adminRoutes = require('./routes/adminRoutes'); 

const { connectDB } = require('./config/db');
const { clearData } = require('./utils/clearData');  // Thêm clearData

// Middleware để parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình Express để phục vụ các tệp tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình session
app.use(session({
  secret: 'your_secret_key',  
  resave: false,
  saveUninitialized: true
}));

// Route trả về trang login (login.html)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
  });
// Route trả về trang home
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  });
//Route trả về trang promotion
app.get('/promotions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'promotions.html'));
});

// Route hiển thị trang đăng khuyến mãi (admin)
app.get('/admin/promotions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_promotions.html'));
});

  

// Đăng ký các route
app.use('/api', flightRoutes);
app.use('/api/users', userRoutes); 
app.use('/admin', adminRoutes);


// Route để kiểm tra quyền truy cập vào admin
app.get('/admin', (req, res) => {
    if (req.session.user && req.session.user.role === 'admin') {
      res.send('Chào admin!');
    } else {
      res.status(403).send('Không có quyền truy cập');
    }
  });
  
  // Route trang user dashboard (dành cho tất cả người dùng đã đăng nhập)
  app.get('/user-dashboard', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
  
    res.send(`Chào ${req.session.user.username}, đây là trang người dùng.`);
  });

// Khởi động server
const port = 3000;
(async () => {
    const connection = await connectDB();
    await createDefaultAdmin();  // Tạo tài khoản admin nếu chưa có
    console.log('Database connected and default admin created!');
  })();
  
 // Khởi tạo server và lưu đối tượng server vào biến
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Lắng nghe tín hiệu SIGINT để dọn dẹp dữ liệu và đóng server
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Clearing data and shutting down...');
  
  try {
    await clearData();  // Gọi hàm xóa dữ liệu
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);  // Thoát chương trình bình thường
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    server.close(() => {
      process.exit(1);  // Thoát chương trình với mã lỗi nếu có lỗi
    });
  }
});