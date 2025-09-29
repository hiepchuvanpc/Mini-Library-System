const { pool } = require('../config/database');

const getAllGenres = async () => {
    const [rows] = await pool.query('SELECT * FROM genres ORDER BY name');
    return rows;
};

const createGenre = async (name) => {
    const [result] = await pool.query('INSERT INTO genres (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
};

const findGenreById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM genres WHERE id = ?', [id]);
    return rows[0];
};

const updateGenre = async (id, name) => {
    await pool.query('UPDATE genres SET name = ? WHERE id = ?', [name, id]);
    return { id, name };
};

// === HÀM XÓA ĐÃ ĐƯỢC CẬP NHẬT LOGIC ===
const deleteGenre = async (id) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Bước 1: Xóa tất cả các liên kết của thể loại này trong bảng book_genres
        await connection.query('DELETE FROM book_genres WHERE genre_id = ?', [id]);

        // Bước 2: Xóa chính thể loại đó trong bảng genres
        await connection.query('DELETE FROM genres WHERE id = ?', [id]);

        await connection.commit();
        return { id };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllGenres,
    createGenre,
    findGenreById,
    updateGenre,
    deleteGenre
};