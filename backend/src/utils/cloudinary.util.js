const cloudinary = require('cloudinary').v2;

const deleteFile = async (fileUrl) => {
    try {
        // Trích xuất public_id từ URL của Cloudinary
        // URL có dạng: http://res.cloudinary.com/<cloud_name>/raw/upload/v.../<folder>/<public_id>.<format>
        const parts = fileUrl.split('/');
        const publicIdWithFormat = parts[parts.length - 1];
        const publicId = `${parts[parts.length - 2]}/${publicIdWithFormat.split('.')[0]}`;

        if (!publicId) return;

        // Xóa file bằng public_id
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    } catch (error) {
        console.error("Lỗi khi xóa file trên Cloudinary:", error);
    }
};

module.exports = { deleteFile };