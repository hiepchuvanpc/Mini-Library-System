const mysql = require('mysql2/promise');
require('dotenv').config();

// Sử dụng connection pool để quản lý và tái sử dụng các kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Hàm kiểm tra kết nối
async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
}

module.exports = {
    pool,
    checkConnection
};