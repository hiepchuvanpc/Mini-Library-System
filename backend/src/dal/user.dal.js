const { pool } = require('../config/database');

// Tìm một người dùng dựa trên username
const findUserByUsername = async (username) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

// Tìm một người dùng dựa trên email
const findUserByEmail = async (email) => {
    if (!email) return null;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// Tạo một người dùng mới
const createUser = async (username, email, phone, hashedPassword) => {
    const [result] = await pool.query(
        'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)',
        [username, email, phone, hashedPassword]
    );
    return { id: result.insertId, username, email, phone };
};

module.exports = {
    findUserByUsername,
    findUserByEmail,
    createUser,
};