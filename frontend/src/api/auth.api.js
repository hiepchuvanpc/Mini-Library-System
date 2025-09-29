import axios from 'axios';

// Tạo một instance axios với cấu hình mặc định
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Trỏ đến backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

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