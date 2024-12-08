const { connectDB } = require('../config/db');

async function getAllFlights() {
  const connection = await connectDB();
  const [rows] = await connection.query('SELECT * FROM flights');

  if (rows.length === 1) {
    return rows[0];  
  } else if (rows.length > 1) {
    const flightsObj = {};
    rows.forEach(flight => {
      flightsObj[flight.id] = flight; // Sử dụng ID chuyến bay làm key
    });
    return flightsObj;  // Trả về object với mỗi chuyến bay là key
  } else {
    return {}; // Nếu không có chuyến bay nào, trả về object rỗng
  }
}

module.exports = { getAllFlights };
