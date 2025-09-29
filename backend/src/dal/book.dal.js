const { pool } = require('../config/database');

const createBook = async (bookData, detailsData, genreIds) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { title, author, isbn, description, thumbnail } = bookData;
        const [bookResult] = await connection.query(
            'INSERT INTO books (title, author, isbn, description, thumbnail) VALUES (?, ?, ?, ?, ?)',
            [title, author, isbn, description, thumbnail]
        );
        const bookId = bookResult.insertId;
        if (detailsData && detailsData.length > 0) {
            for (const detail of detailsData) {
                await connection.query(
                    'INSERT INTO book_details (book_id, type, location_or_url, quantity_total, quantity_available) VALUES (?, ?, ?, ?, ?)',
                    [bookId, detail.type, detail.location_or_url, detail.quantity_total || 1, detail.quantity_available || 1]
                );
            }
        }
        if (genreIds && genreIds.length > 0) {
            const genreValues = genreIds.map(genreId => [bookId, genreId]);
            await connection.query('INSERT INTO book_genres (book_id, genre_id) VALUES ?', [genreValues]);
        }
        await connection.commit();
        return { id: bookId, ...bookData };
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi trong createBook DAL:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const updateBook = async (bookId, bookData, detailsData, genreIds, newDigitalUrl, existingDigitalDetail) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { title, author, isbn, description, thumbnail } = bookData;
        await connection.query(
            'UPDATE books SET title = ?, author = ?, isbn = ?, description = ?, thumbnail = ? WHERE id = ?',
            [title, author, isbn, description, thumbnail, bookId]
        );
        await connection.query('DELETE FROM book_genres WHERE book_id = ?', [bookId]);
        if (genreIds && genreIds.length > 0) {
            const genreValues = genreIds.map(genreId => [bookId, genreId]);
            await connection.query('INSERT INTO book_genres (book_id, genre_id) VALUES ?', [genreValues]);
        }
        if (newDigitalUrl) {
            if (existingDigitalDetail) {
                await connection.query('UPDATE book_details SET location_or_url = ? WHERE id = ?', [newDigitalUrl, existingDigitalDetail.id]);
            } else {
                await connection.query(
                    'INSERT INTO book_details (book_id, type, location_or_url, quantity_total, quantity_available) VALUES (?, "digital", ?, 1, 1)',
                    [bookId, newDigitalUrl]
                );
            }
        }
        const physicalDetails = detailsData.filter(d => d.type === 'physical');
        const [existingPhysicals] = await connection.query("SELECT id FROM book_details WHERE book_id = ? AND type = 'physical'", [bookId]);
        const existingPhysicalIds = existingPhysicals.map(d => d.id);
        const incomingPhysicalIds = [];
        for (const detail of physicalDetails) {
            if (detail.id) {
                incomingPhysicalIds.push(detail.id);
                await connection.query(
                    'UPDATE book_details SET location_or_url = ?, quantity_total = ?, quantity_available = ? WHERE id = ?',
                    [detail.location_or_url, detail.quantity_total, detail.quantity_available, detail.id]
                );
            } else {
                const [newDetailResult] = await connection.query(
                    'INSERT INTO book_details (book_id, type, location_or_url, quantity_total, quantity_available) VALUES (?, "physical", ?, ?, ?)',
                    [bookId, detail.location_or_url, detail.quantity_total, detail.quantity_available]
                );
                incomingPhysicalIds.push(newDetailResult.insertId);
            }
        }
        const detailsToDelete = existingPhysicalIds.filter(id => !incomingPhysicalIds.includes(id));
        if (detailsToDelete.length > 0) {
            await connection.query('DELETE FROM book_details WHERE id IN (?)', [detailsToDelete]);
        }
        await connection.commit();
        return { id: bookId, ...bookData };
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi trong updateBook DAL:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const findBookById = async (id) => {
    const bookQuery = `
        SELECT
            b.*,
            GROUP_CONCAT(DISTINCT g.id) as genre_ids
        FROM books b
        LEFT JOIN book_genres bg ON b.id = bg.book_id
        LEFT JOIN genres g ON bg.genre_id = g.id
        WHERE b.id = ?
        GROUP BY b.id
    `;
    const [bookRows] = await pool.query(bookQuery, [id]);
    if (bookRows.length === 0) return null;
    const book = bookRows[0];
    const [detailsRows] = await pool.query('SELECT * FROM book_details WHERE book_id = ?', [id]);
    book.details = detailsRows;
    book.genre_ids = book.genre_ids ? book.genre_ids.split(',').map(Number) : [];
    return book;
};

const searchBooks = async (term) => {
    const query = `
        SELECT DISTINCT
            b.id, b.title, b.author, b.isbn, b.thumbnail
        FROM books b
        LEFT JOIN book_genres bg ON b.id = bg.book_id
        LEFT JOIN genres g ON bg.genre_id = g.id
        WHERE
            b.title LIKE ? OR
            b.author LIKE ? OR
            b.isbn LIKE ? OR
            g.name LIKE ?
        LIMIT 10
    `;
    const searchTerm = `%${term}%`;
    const [rows] = await pool.query(query, [searchTerm, searchTerm, searchTerm, searchTerm]);
    return rows;
};

const getAllBooksForAdmin = async () => {
    const query = `
        SELECT
            b.id, b.title, b.author, b.isbn, b.thumbnail
        FROM books b
        ORDER BY b.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

const deleteBook = async (id) => {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows;
};

const deleteBookDetail = async (detailId) => {
    const [result] = await pool.query('DELETE FROM book_details WHERE id = ?', [detailId]);
    return result.affectedRows;
};

module.exports = {
    createBook,
    updateBook,
    findBookById,
    searchBooks,
    getAllBooksForAdmin,
    deleteBook,
    deleteBookDetail
};