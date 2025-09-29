const express = require('express');
const router = express.Router();
const genreBLL = require('../bll/genre.bll');
const { isAdmin } = require('../middleware/auth.middleware');

// GET /api/genres - Lấy tất cả thể loại (công khai cho mọi người)
router.get('/', async (req, res) => {
    try {
        const genres = await genreBLL.getGenres();
        res.status(200).json(genres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/genres - Thêm thể loại mới (chỉ Admin)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const newGenre = await genreBLL.addGenre(name);
        res.status(201).json(newGenre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/genres/:id - Cập nhật thể loại (chỉ Admin)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedGenre = await genreBLL.editGenre(Number(id), name);
        res.status(200).json(updatedGenre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/genres/:id - Xóa thể loại (chỉ Admin)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await genreBLL.removeGenre(Number(id));
        res.status(200).json({ message: 'Xóa thể loại thành công.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;