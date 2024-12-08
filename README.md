#Hướng-dẫn-cài-đặt
1. Clone git project về máy
2. Tải các thư viện cần thiết nếu cần ( node, express, bycrypt, ..v...v..) cứ chạy node server.js thiếu cái gì thì tải cái đấy.
3. Tải XAMPP hoặc MYSQL workbench nếu chưa có. Vào config/db.js sửa username/password. Chạy thử node server.js xem kết nối csdl thành công chưa. CSDL sẽ tự tạo.
4. Vào localhost:/3000 xem qua
5. Vào thư mục public để cài đặt giao diện

#Hướng-dẫn-đọc-hiểu-code
- server.js là file quan trọng nhất, hiển thị và kết nối với frontend đều ở đây
- routes và các file như kiểu userRoutes.js sẽ thiết lập đường dẫn cho request và gọi đến các thứ cần như middlesware để xử lý và database
- các file module chủ yếu để xử lý với thao tác csdl
- Ncl routes là địa điểm để 2 bên backend với frontend gửi nhận và xử lý request, khi fetch nếu là GET thì nên vào api xem là mình cần lấy cái gì, nếu là POST thì note comment lại xem gửi những thông tin gì
   
