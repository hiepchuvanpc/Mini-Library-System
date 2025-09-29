const userDAL = require('../dal/user.dal');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Nghiệp vụ đăng ký
const registerUser = async (userData) => {
    const { username, email, phone, password } = userData;

    // 1. Kiểm tra username hoặc email đã tồn tại chưa
    if (await userDAL.findUserByUsername(username)) {
        throw new Error('Tên đăng nhập đã tồn tại.');
    }
    if (email && await userDAL.findUserByEmail(email)) {
        throw new Error('Email đã tồn tại.');
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Gọi DAL để lưu người dùng
    const newUser = await userDAL.createUser(username, email, phone, hashedPassword);
    return newUser;
};

// Nghiệp vụ đăng nhập
const loginUser = async (loginData) => {
    const { username, password } = loginData;
    const user = await userDAL.findUserByUsername(username);
    if (!user) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        account_status: user.account_status,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            account_status: user.account_status,
        },
    };
};

module.exports = {
    registerUser,
    loginUser,
};