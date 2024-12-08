const mysql = require('mysql2/promise');



const dbConfig = {
  host: 'localhost',
  user: 'root',           
  password: '',          
  database: 'airline01_db', 
};

// Tạo kết nối đến MySQL khi ứng dụng bắt đầu
let connection;

async function connectDB() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    console.log('Connected to MySQL server');

    // Tạo database nếu chưa có
    await createDatabaseIfNotExist(connection);

    // Chuyển sang database đã tạo hoặc nếu đã tồn tại
    await connection.changeUser({ database: dbConfig.database });

    // Tạo các bảng nếu chưa có
    await createTables(connection);
    // Load dữ liệu mẫu vào các bảng nếu cần
  }

  return connection;
}

// Tạo database nếu chưa tồn tại
async function createDatabaseIfNotExist(connection) {
  const [databases] = await connection.query('SHOW DATABASES');
  const dbExists = databases.some(db => db.Database === dbConfig.database);

  if (!dbExists) {
    // Tạo cơ sở dữ liệu nếu chưa có
    await connection.query('CREATE DATABASE ' + dbConfig.database);
    console.log('Database ' + dbConfig.database + ' created.');
  }
}

// Tạo các bảng nếu chưa có
async function createTables(connection) {
  const createLocationsTable = `
    CREATE TABLE IF NOT EXISTS locations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;
  const createTicketTypesTable = `
    CREATE TABLE IF NOT EXISTS ticket_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name ENUM('Phổ thông', 'Thương gia', 'Business', 'Economy') NOT NULL,
      description TEXT,
      category ENUM('Adult', 'Child', 'Infant') NOT NULL,
      trip_type ENUM('One-way', 'Round-trip') NOT NULL,
      airline VARCHAR(255) NOT NULL
    );
  `;
  const createAirplanesTable = `
  CREATE TABLE IF NOT EXISTS airplanes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    airplane_code VARCHAR(255) NOT NULL UNIQUE,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    seat_count INT,
    description TEXT
  );
`;
const createFlightsTable = `
CREATE TABLE IF NOT EXISTS flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flight_code VARCHAR(255) NOT NULL UNIQUE,
  departure_location_id INT,
  arrival_location_id INT,
  departure_time DATETIME,
  arrival_time DATETIME,
  airline VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
  airplane_id INT,  -- Thêm khóa ngoại tham chiếu đến bảng airplanes
  FOREIGN KEY (departure_location_id) REFERENCES locations(id),
  FOREIGN KEY (arrival_location_id) REFERENCES locations(id),
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id)  -- Liên kết với bảng airplanes
);
`;


  const createPricesTable = `
    CREATE TABLE IF NOT EXISTS prices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      flight_id INT,
      ticket_type_id INT,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (flight_id) REFERENCES flights(id),
      FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id)
    );
  `;
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      full_name VARCHAR(255),
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    user_id INT,  -- ID người dùng
    total_price DECIMAL(10, 2),  
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',  
    voucher_id INT, 
    FOREIGN KEY (user_id) REFERENCES users(id),  
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) 
  );
`;

const createOrderDetailsTable = `
  CREATE TABLE IF NOT EXISTS order_details (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    order_id INT, 
    flight_id INT,  
    ticket_type_id INT, 
    quantity INT DEFAULT 1, 
    price_id INT, 
    FOREIGN KEY (order_id) REFERENCES orders(id), 
    FOREIGN KEY (flight_id) REFERENCES flights(id), 
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),  
    FOREIGN KEY (price_id) REFERENCES prices(id)  
  );
`;

  const createVouchersTable = `
  CREATE TABLE IF NOT EXISTS vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    code VARCHAR(255) NOT NULL UNIQUE,  
    discount DECIMAL(5, 2) NOT NULL, 
    expiration_date TIMESTAMP NOT NULL,  
    status ENUM('Active', 'Expired', 'Used') NOT NULL DEFAULT 'Active'  
  );
`;
const createPromotionsTable = `
  CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    title VARCHAR(255) NOT NULL,  
    description TEXT NOT NULL, 
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  
    end_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active'  
  );
`;



  // Thực hiện các câu lệnh SQL tạo bảng
  await connection.query(createLocationsTable);
  await connection.query(createTicketTypesTable);
  await connection.query(createAirplanesTable);
  await connection.query(createFlightsTable);
  await connection.query(createPricesTable);
  await connection.query(createVouchersTable);
  await connection.query(createUsersTable);
  await connection.query(createOrdersTable);
  await connection.query(createOrderDetailsTable);
  await connection.query(createPromotionsTable);



  console.log('Tables created (if not already exist)');
}

module.exports = { connectDB };
