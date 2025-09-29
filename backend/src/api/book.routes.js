const express = require('express');
const router = express.Router();
const bookBLL = require('../bll/book.bll');
const { isAdmin } = require('../middleware/auth.middleware');
const upload = require('../config/cloudinary.config');

const uploader = upload.fields([
    { name: 'ebookFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]);

router.get('/search', async (req, res) => {
    try {
        const results = await bookBLL.searchBooks(req.query.term);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/admin/all', isAdmin, async (req, res) => {
    try {
        const books = await bookBLL.getAllBooks();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/isbn/:isbn', async (req, res) => {
    try {
        const bookData = await bookBLL.findBookByIsbn(req.params.isbn);
        res.status(200).json(bookData);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const book = await bookBLL.getBookDetails(Number(req.params.id));
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.post('/', isAdmin, uploader, async (req, res) => {
    try {
        const newBook = await bookBLL.addBook(req.body, req.files);
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', isAdmin, uploader, async (req, res) => {
    try {
        const updatedBook = await bookBLL.editBook(Number(req.params.id), req.body, req.files);
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const result = await bookBLL.removeBook(Number(req.params.id));
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;