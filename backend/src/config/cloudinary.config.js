const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path'); // <-- Thêm thư viện 'path' của Node.js
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Hàm slugify để tạo tên file an toàn cho URL
    const slugify = (str) =>
      str.toLowerCase()
         .trim()
         .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
         .replace(/[èéẹẻẽêềếệểễ]/g, "e")
         .replace(/[ìíịỉĩ]/g, "i")
         .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
         .replace(/[ùúụủũưừứựửữ]/g, "u")
         .replace(/[ỳýỵỷỹ]/g, "y")
         .replace(/đ/g, "d")
         .replace(/\s+/g, '-')
         .replace(/[^\w\-]+/g, '');

    const title = req.body.title ? slugify(req.body.title) : 'ebook';
    const isbn = req.body.isbn || Date.now();

    // Lấy tên file gốc không bao gồm đuôi file
    const baseName = `${title}-${isbn}`;

    // Lấy đuôi file từ tên file gốc (ví dụ: 'epub' từ 'The-Great-Gatsby.epub')
    const format = path.extname(file.originalname).substring(1);

    return {
      folder: 'mini-library-ebooks',
      resource_type: 'raw',
      public_id: baseName, // <-- Tên file chính, không có đuôi
      format: format      // <-- Chỉ định rõ định dạng (đuôi file)
    };
  }
});

// Phần còn lại của file giữ nguyên
const ALLOWED_MIME_TYPES = {
    'application/pdf': true,
    'application/epub+zip': true,
    'application/vnd.amazon.ebook': true,
    'application/x-mobipocket-ebook': true
};

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng file không được hỗ trợ! Chỉ chấp nhận PDF, EPUB, MOBI, AZW.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;