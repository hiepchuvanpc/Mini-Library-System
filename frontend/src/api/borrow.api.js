import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Interceptor để tự động xử lý lỗi token hết hạn
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || { message: 'An error occurred' });
    }
);

export const requestBorrowApi = async (borrowData, token) => {
    try {
        const response = await apiClient.post('/borrows/request', borrowData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) { throw error; }
};

export const getMyHistoryApi = async (token) => {
    try {
        const response = await apiClient.get('/borrows/my-history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) { throw error; }
};

export const getAllBorrowsAdminApi = async (token) => {
    try {
        const response = await apiClient.get('/borrows/admin/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) { throw error; }
};

export const updateBorrowStatusApi = async (id, status, token) => {
    try {
        const response = await apiClient.patch(`/borrows/admin/${id}/status`, { status }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) { throw error; }
};

// === HÀM CÒN THIẾU ĐÃ ĐƯỢC BỔ SUNG ===
export const userReturnBookApi = async (borrowId, token) => {
    try {
        // Gửi request PATCH tới endpoint tương ứng, không cần gửi body
        const response = await apiClient.patch(`/borrows/my-history/${borrowId}/return`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};