// src/dal/search.dal.js
const { pool } = require('../config/database');

const autocompleteSearch = async (term) => {
    const searchTerm = `%${term}%`;
    const query = `
        (SELECT 'book' as type, id, title as value FROM books WHERE title LIKE ? LIMIT 5)
        UNION
        (SELECT 'author' as type, id, name as value FROM authors WHERE name LIKE ? LIMIT 3)
        UNION
        (SELECT 'genre' as type, id, name as value FROM genres WHERE name LIKE ? LIMIT 3)
    `;
    const [rows] = await pool.query(query, [searchTerm, searchTerm, searchTerm]);
    return rows;
};


const advancedSearch = async (filters) => {
    let query = `
        SELECT DISTINCT b.id, b.title, b.isbn, b.thumbnail,
        (SELECT GROUP_CONCAT(a.name SEPARATOR ', ') FROM authors a JOIN book_authors ba ON a.id = ba.author_id WHERE ba.book_id = b.id) as author
        FROM books b
    `;
    const params = [];
    let whereConditions = [];

    // Lọc theo tên sách
    if (filters.title) {
        whereConditions.push(`b.title LIKE ?`);
        params.push(`%${filters.title}%`);
    }

    // Lọc theo tác giả (JOIN)
    if (filters.author) {
        query += ` JOIN book_authors ba_search ON b.id = ba_search.book_id
                   JOIN authors a_search ON ba_search.author_id = a_search.id`;
        whereConditions.push(`a_search.name LIKE ?`);
        params.push(`%${filters.author}%`);
    }

    if (filters.genres && filters.genres.length > 0) {
        if (filters.genre_mode === 'and') {
            query += ` JOIN book_genres bg_inc ON b.id = bg_inc.book_id`;
            whereConditions.push(`bg_inc.genre_id IN (?)`);
            params.push(filters.genres);
        } else {
            const subquery = `b.id IN (SELECT book_id FROM book_genres WHERE genre_id IN (?))`;
            whereConditions.push(subquery);
            params.push(filters.genres);
        }
    }

    if (filters.exclude_genres && filters.exclude_genres.length > 0) {
        const subquery = `b.id NOT IN (SELECT book_id FROM book_genres WHERE genre_id IN (?))`;
        whereConditions.push(subquery);
        params.push(filters.exclude_genres);
    }

    if (whereConditions.length > 0) {
        query += ` WHERE ` + whereConditions.join(' AND ');
    }

    if (filters.genres && filters.genres.length > 0 && filters.genre_mode === 'and') {
        query += ` GROUP BY b.id, b.title, b.author, b.isbn, b.thumbnail
                   HAVING COUNT(DISTINCT bg_inc.genre_id) = ?`;
        params.push(filters.genres.length);
    }

    if (filters.sortBy === 'title') {
        query += ` ORDER BY b.title ${filters.order === 'asc' ? 'ASC' : 'DESC'}`;
    } else {
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