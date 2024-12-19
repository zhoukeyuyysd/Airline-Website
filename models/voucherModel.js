// models/voucherModel.js
async function getVoucherByCode(voucherCode) {
    const connection = await connectDB();
    const [rows] = await connection.query(
      'SELECT * FROM vouchers WHERE code = ? AND status = "Active" AND expiration_date > NOW()',
      [voucherCode]
    );
    return rows.length > 0 ? rows[0] : null;
  }
  
  module.exports = { getVoucherByCode };
  
