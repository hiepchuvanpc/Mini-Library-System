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

const deleteGenre = async (id) => {
    // Cần kiểm tra xem có sách nào thuộc thể loại này không trước khi xóa
    const [books] = await pool.query('SELECT id FROM books WHERE genre_id = ?', [id]);
    if (books.length > 0) {
        throw new Error('Không thể xóa thể loại đã có sách.');
    }
    await pool.query('DELETE FROM genres WHERE id = ?', [id]);
    return { id };
};

module.exports = {
    getAllGenres,
    createGenre,
    findGenreById,
    updateGenre,
    deleteGenre
};