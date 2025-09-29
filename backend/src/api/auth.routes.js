const express = require('express');
const router = express.Router();
const authBLL = require('../bll/auth.bll');

// Định nghĩa route cho Đăng ký
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const newUser = await authBLL.registerUser(req.body);
        res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Định nghĩa route cho Đăng nhập
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const result = await authBLL.loginUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

module.exports = router;