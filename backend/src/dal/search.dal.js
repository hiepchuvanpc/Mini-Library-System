const { pool } = require('../config/database');

const autocompleteSearch = async (term) => {
    const searchTerm = `%${term}%`;
    // Câu lệnh SQL này sử dụng UNION để gộp kết quả từ 3 truy vấn khác nhau
    const query = `
        (SELECT 'book' as type, id, title as value FROM books WHERE title LIKE ? LIMIT 5)
        UNION
        (SELECT 'author' as type, NULL as id, author as value FROM books WHERE author LIKE ? GROUP BY author LIMIT 3)
        UNION
        (SELECT 'genre' as type, id, name as value FROM genres WHERE name LIKE ? LIMIT 3)
    `;
    const [rows] = await pool.query(query, [searchTerm, searchTerm, searchTerm]);
    return rows;
};

const advancedSearch = async (filters) => {
    let query = `
        SELECT DISTINCT
            b.id, b.title, b.author, b.isbn, b.thumbnail
        FROM books b
        LEFT JOIN book_genres bg ON b.id = bg.book_id
        LEFT JOIN genres g ON bg.genre_id = g.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.query) {
        query += ` AND (b.title LIKE ? OR b.author LIKE ?)`;
        params.push(`%${filters.query}%`);
        params.push(`%${filters.query}%`);
    }
    if (filters.genres && filters.genres.length > 0) {
        const genreIds = filters.genres.map(id => parseInt(id)).filter(Number.isInteger);
        if (genreIds.length > 0) {
            query += ` AND g.id IN (?)`;
            params.push(genreIds);
        }
    }
    if (filters.sortBy === 'createdAt') {
        query += ` ORDER BY b.created_at ${filters.order === 'asc' ? 'ASC' : 'DESC'}`;
    }
    if (filters.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.query(query, params);
    return rows;
};

module.exports = { autocompleteSearch, advancedSearch };