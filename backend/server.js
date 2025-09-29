const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { checkConnection } = require('./src/config/database');
const { startScheduledTasks } = require('./src/services/cron.service');
const authRoutes = require('./src/api/auth.routes');
const genreRoutes = require('./src/api/genre.routes');
const bookRoutes = require('./src/api/book.routes');
const searchRoutes = require('./src/api/search.routes');
const borrowRoutes = require('./src/api/borrow.routes');
// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng các middleware
app.use(cors()); // Cho phép các domain khác gọi API
app.use(express.json()); // Phân tích request body dưới dạng JSON

// Kiểm tra kết nối database khi server khởi động
checkConnection();
startScheduledTasks();

// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Mini Library Management System API!' });
});

// Sử dụng các route
app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/borrows', borrowRoutes);

// Bất kỳ lỗi nào được 'next(error)' từ các route sẽ rơi vào đây
app.use((err, req, res, next) => {
    console.error('!!! ĐÃ CÓ LỖI XẢY RA !!!');
    console.error(err.stack); // In ra đầy đủ thông tin lỗi và stack trace
    res.status(500).json({
        success: false,
        message: 'Đã có lỗi xảy ra ở phía server, vui lòng kiểm tra log.',
        error: err.message
    });
});

// Lắng nghe server ở port đã định nghĩa
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}.`);
});