const bookDAL = require('../dal/book.dal');
const ISBNService = require('../services/isbn.service');
const { deleteFile } = require('../utils/cloudinary.util');

const addBook = async (bookPayload, files = {}) => {
    const { title, author } = bookPayload;
    if (!title || !author) throw new Error('Tên sách và tác giả là bắt buộc.');
    if (files.coverImage && files.coverImage[0]) {
        bookPayload.thumbnail = files.coverImage[0].path;
    }
    let details = bookPayload.details ? JSON.parse(bookPayload.details) : [];
    if (files.ebookFile && files.ebookFile[0]) {
        details.push({
            type: 'digital',
            location_or_url: files.ebookFile[0].path,
            quantity_total: 1,
            quantity_available: 1
        });
    }
    const bookData = {
        title, author,
        isbn: bookPayload.isbn,
        description: bookPayload.description,
        thumbnail: bookPayload.thumbnail
    };
    const genreIds = bookPayload.genreIds ? JSON.parse(bookPayload.genreIds) : [];
    return await bookDAL.createBook(bookData, details, genreIds);
};

const editBook = async (id, bookPayload, files = {}) => {
    const existingBook = await bookDAL.findBookById(id);
    if (!existingBook) throw new Error('Không tìm thấy sách.');
    if (files.coverImage && files.coverImage[0]) {
        if (existingBook.thumbnail && !existingBook.thumbnail.includes('placeholder')) {
            await deleteFile(existingBook.thumbnail);
        }
        bookPayload.thumbnail = files.coverImage[0].path;
    } else {
        bookPayload.thumbnail = existingBook.thumbnail;
    }
    let existingDigitalDetail = existingBook.details.find(d => d.type === 'digital');
    const deleteEbook = bookPayload.deleteEbook === 'true';
    if (!files.ebookFile && existingDigitalDetail && deleteEbook) {
        await deleteFile(existingDigitalDetail.location_or_url);
        await bookDAL.deleteBookDetail(existingDigitalDetail.id);
        existingDigitalDetail = null;
    }
    let newDigitalUrl = null;
    if (files.ebookFile && files.ebookFile[0]) {
        if (existingDigitalDetail) {
            await deleteFile(existingDigitalDetail.location_or_url);
        }
        newDigitalUrl = files.ebookFile[0].path;
    }
    const bookData = {
        title: bookPayload.title,
        author: bookPayload.author,
        isbn: bookPayload.isbn,
        description: bookPayload.description,
        thumbnail: bookPayload.thumbnail
    };
    const detailsData = bookPayload.details ? JSON.parse(bookPayload.details) : [];
    const genreIds = bookPayload.genreIds ? JSON.parse(bookPayload.genreIds) : [];
    return await bookDAL.updateBook(id, bookData, detailsData, genreIds, newDigitalUrl, existingDigitalDetail);
};

const getBookDetails = async (id) => {
    const book = await bookDAL.findBookById(id);
    if (!book) throw new Error('Không tìm thấy sách.');
    return book;
};

const findBookByIsbn = async (isbn) => {
    return await ISBNService.lookupByISBN(isbn);
};

const searchBooks = async (term) => {
    if (!term || term.length < 2) {
        return [];
    }
    return await bookDAL.searchBooks(term);
};

const getAllBooks = async () => {
    return await bookDAL.getAllBooksForAdmin();
};

const removeBook = async (id) => {
    const existingBook = await bookDAL.findBookById(id);
    if (!existingBook) throw new Error('Không tìm thấy sách để xóa.');
    if (existingBook.thumbnail && !existingBook.thumbnail.includes('placeholder')) {
        await deleteFile(existingBook.thumbnail);
    }
    const digitalDetails = existingBook.details.filter(d => d.type === 'digital');
    for (const detail of digitalDetails) {
        await deleteFile(detail.location_or_url);
    }
    await bookDAL.deleteBook(id);
    return { message: 'Xóa sách thành công.' };
};

module.exports = { addBook, editBook, getBookDetails, findBookByIsbn, searchBooks, getAllBooks, removeBook };