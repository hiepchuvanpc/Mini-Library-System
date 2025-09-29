import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Hàm này đã có trong book.api.js, bạn có thể chuyển nó qua đây
export const getGenresApi = async () => {
    try {
        const response = await apiClient.get('/genres');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const createGenreApi = async (genreData, token) => {
    try {
        const response = await apiClient.post('/genres', genreData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateGenreApi = async (id, genreData, token) => {
    try {
        const response = await apiClient.put(`/genres/${id}`, genreData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const deleteGenreApi = async (id, token) => {
    try {
        const response = await apiClient.delete(`/genres/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};