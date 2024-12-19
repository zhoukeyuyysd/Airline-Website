const { connectDB } = require('../config/db');

async function getAllFlights() {
  const connection = await connectDB();
  const [rows] = await connection.query(`
    SELECT 
      f.id,
      f.flight_code,
      f.departure_time,
      f.arrival_time,
      f.airline,
      f.status,
      departure.name AS departure_location_name,
      arrival.name AS arrival_location_name,
      a.airplane_code AS airplane_code
    FROM 
      flights f
    JOIN 
      locations departure ON f.departure_location_id = departure.id
    JOIN 
      locations arrival ON f.arrival_location_id = arrival.id
    JOIN 
      airplanes a ON f.airplane_id = a.id;
  `);

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
