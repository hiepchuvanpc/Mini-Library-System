const genreDAL = require('../dal/genre.dal');

const getGenres = async () => {
    return await genreDAL.getAllGenres();
};

const addGenre = async (name) => {
    // Có thể thêm logic kiểm tra tên đã tồn tại chưa ở đây
    return await genreDAL.createGenre(name);
};

const editGenre = async (id, name) => {
    const existingGenre = await genreDAL.findGenreById(id);
    if (!existingGenre) {
        throw new Error('Không tìm thấy thể loại.');
    }
    return await genreDAL.updateGenre(id, name);
};

const removeGenre = async (id) => {
    const existingGenre = await genreDAL.findGenreById(id);
    if (!existingGenre) {
        throw new Error('Không tìm thấy thể loại.');
    }
    return await genreDAL.deleteGenre(id);
};

module.exports = {
    getGenres,
    addGenre,
    editGenre,
    removeGenre
};