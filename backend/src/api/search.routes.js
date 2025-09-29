// src/api/search.routes.js

const express = require('express');
const router = express.Router();
const searchDAL = require('../dal/search.dal');

/**
 * Helper function để parse và làm sạch mảng ID từ query string.
 * @param {string} queryString - Chuỗi từ URL, ví dụ "1,5,abc,".
 * @returns {number[]} - Một mảng các số nguyên hợp lệ, ví dụ [1, 5].
 */
const parseIntegerArray = (queryString) => {
    if (!queryString || typeof queryString !== 'string') {
        return [];
    }
    return queryString
        .split(',') // Tách chuỗi bằng dấu phẩy -> ['1', '5', 'abc', '']
        .filter(id => id) // Lọc bỏ các phần tử rỗng -> ['1', '5', 'abc']
        .map(id => parseInt(id.trim(), 10)) // Chuyển từng phần tử thành số nguyên -> [1, 5, NaN]
        .filter(Number.isInteger); // Lọc bỏ những giá trị không phải là số (NaN) -> [1, 5]
};

// Route cho chức năng autocomplete (không đổi)
router.get('/autocomplete', async (req, res) => {
    try {
        const term = req.query.term;
        if (!term || term.length < 2) {
            return res.json([]);
        }
        const results = await searchDAL.autocompleteSearch(term);
        res.json(results);
    } catch (error) {
        console.error("Lỗi trong autocomplete route:", error);
        res.status(500).json({ message: error.message });
    }
});

// Route cho tìm kiếm nâng cao (đã được cập nhật)
router.get('/', async (req, res) => {
    try {
        const {
            title,            // THAY 'q' BẰNG 'title'
            author,           // THÊM 'author'
            genres,
            exclude_genres,
            genre_mode,
            sortBy,
            order,
            limit
        } = req.query;

        const filters = {
            title: title || '',
            author: author || '',
            genres: parseIntegerArray(genres),
            exclude_genres: parseIntegerArray(exclude_genres),
            genre_mode: (genre_mode === 'and' || genre_mode === 'or') ? genre_mode : 'or',
            sortBy: (sortBy === 'createdAt' || sortBy === 'title') ? sortBy : 'createdAt',
            order: (order === 'asc' || order === 'desc') ? order : 'desc',
            limit: limit ? parseInt(limit, 10) : undefined
        };

        const results = await searchDAL.advancedSearch(filters);
        res.json(results);
    } catch (error) {
        console.error("Lỗi trong search route:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;