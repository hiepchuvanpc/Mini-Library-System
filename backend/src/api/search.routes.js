const express = require('express');
const router = express.Router();
const searchDAL = require('../dal/search.dal'); // Gọi thẳng DAL cho đơn giản

router.get('/autocomplete', async (req, res) => {
    try {
        const term = req.query.term;
        if (!term || term.length < 2) {
            return res.json([]);
        }
        const results = await searchDAL.autocompleteSearch(term);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const filters = {
            query: req.query.q || '',
            genres: req.query.genres ? req.query.genres.split(',') : []
        };
        const results = await searchDAL.advancedSearch(filters);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;