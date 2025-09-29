import axios from 'axios';

// Cấu hình một instance axios chung cho toàn bộ API
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response, // Nếu thành công, không làm gì cả
    (error) => {
        // Nếu server trả về lỗi 401 (Unauthorized - thường là do token sai/hết hạn)
        if (error.response && error.response.status === 401) {
            // Xóa thông tin người dùng khỏi localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            // Tải lại trang và chuyển hướng về trang đăng nhập
            window.location.href = '/login';
        }
        // Ném lỗi ra để các hàm catch khác có thể xử lý
        return Promise.reject(error.response.data);
    }
);
// =================================================================
// AUTH APIs
// =================================================================

export const loginApi = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const registerApi = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

// =================================================================
// PUBLIC APIs (Search, Genres, ISBN)
// =================================================================

export const autocompleteSearchApi = async (term) => {
    if (!term || term.length < 2) return [];
    try {
        const response = await apiClient.get(`/search/autocomplete?term=${term}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tìm kiếm autocomplete:", error);
        return [];
    }
};

export const advancedSearchApi = async (params) => {
    try {
        const response = await apiClient.get('/search', { params });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const lookupIsbnApi = async (isbn) => {
    try {
        const response = await apiClient.get(`/books/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getGenresApi = async () => {
    try {
        const response = await apiClient.get('/genres');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};


// =================================================================
// ADMIN BOOK APIs (Protected by Token)
// =================================================================

export const getAllBooksAdminApi = async (token) => {
    try {
        const response = await apiClient.get('/books/admin/all', {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const createBookApi = async (formData, token) => {
    try {
        const response = await apiClient.post('/books', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const updateBookApi = async (bookId, formData, token) => {
    try {
        const response = await apiClient.put(`/books/${bookId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const deleteBookApi = async (bookId, token) => {
    try {
        const response = await apiClient.delete(`/books/${bookId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getBookByIdApi = async (bookId) => {
    try {
        const response = await apiClient.get(`/books/${bookId}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};