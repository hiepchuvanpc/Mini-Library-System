const axios = require('axios');

class ISBNService {
    async lookupByISBN(isbn) {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (!/^\d{10}(\d{3})?$/.test(cleanISBN)) {
            throw new Error('Định dạng ISBN không hợp lệ.');
        }

        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`;
        console.log(`🔍 Tra cứu ISBN ${cleanISBN} bằng Google Books API...`);

        try {
            const response = await axios.get(url, { timeout: 10000 });

            if (!response.data.items || response.data.totalItems === 0) {
                throw new Error('Không tìm thấy sách với ISBN này.');
            }

            const book = response.data.items[0].volumeInfo;
            const bookInfo = {
                title: book.title || '',
                author: book.authors ? book.authors.join(', ') : '',
                description: book.description || '',
                thumbnail: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail || ''
            };

            console.log(`✅ Tìm thấy thông tin: ${bookInfo.title}`);
            return bookInfo;

        } catch (error) {
            console.log(`❌ Google Books API thất bại:`, error.message);
            throw new Error('Lỗi khi tra cứu thông tin ISBN.');
        }
    }
}

module.exports = new ISBNService();