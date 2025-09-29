const jwt = require('jsonwebtoken');

// Middleware kiểm tra xem người dùng đã đăng nhập chưa
const isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Yêu cầu cần token xác thực.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Trả về lỗi 401 để Interceptor của frontend có thể bắt được
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
        req.user = user;
        next();
    });
};

// Middleware kiểm tra xem người dùng có phải là Admin không
const isAdmin = (req, res, next) => {
    // Tái sử dụng isAuth để kiểm tra token trước
    isAuth(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền truy cập.' });
        }
        next();
    });
};

// Đảm bảo bạn export cả hai hàm
module.exports = { isAdmin, isAuth };