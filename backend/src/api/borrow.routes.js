// src/api/borrow.routes.js

const express = require('express');
const router = express.Router();
const borrowDAL = require('../dal/borrow.dal');
const { isAuth, isAdmin } = require('../middleware/auth.middleware');

// User routes
router.post('/request', isAuth, async (req, res) => {
    try {
        const { borrowItems } = req.body;
        if (!borrowItems || !Array.isArray(borrowItems) || borrowItems.length === 0) {
            return res.status(400).json({ message: 'Thông tin mượn sách không hợp lệ.' });
        }
        const result = await borrowDAL.requestBorrow(req.user.id, borrowItems);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error in /borrows/request:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/my-history', isAuth, async (req, res) => {
    try {
        const history = await borrowDAL.getHistoryForUser(req.user.id);
        res.json(history);
    } catch (error) {
        console.error("Error in /borrows/my-history:", error);
        res.status(500).json({ message: error.message });
    }
});

// === ROUTE ĐƯỢC CẬP NHẬT LOGIC ===
router.get('/my-shelf', isAuth, async (req, res) => {
    try {
        const currentBorrows = await borrowDAL.getCurrentBorrowsForUser(req.user.id);
        const returnedHistory = await borrowDAL.getReturnedHistoryForUser(req.user.id);

        // Trả về một object chứa cả hai danh sách
        res.json({
            current: currentBorrows,
            returned: returnedHistory
        });
    } catch (error) {
        console.error("Error in /borrows/my-shelf:", error);
        res.status(500).json({ message: error.message });
    }
});


router.patch('/my-history/:id/return', isAuth, async (req, res) => {
    try {
        // Chú ý: Route này vẫn đúng, vì 'my-history' chỉ là tên,
        // hành động là "return" một "borrowing_history" record.
        const result = await borrowDAL.userReturnBook(req.params.id, req.user.id);
        res.json(result);
    } catch (error) {
        console.error("Error in /borrows/my-history/:id/return:", error);
        res.status(400).json({ message: error.message });
    }
});

// Admin routes
router.get('/admin/all', isAdmin, async (req, res) => {
    try {
        const requests = await borrowDAL.getAllBorrowRequests();
        res.json(requests);
    } catch (error) {
        console.error("Error in /borrows/admin/all:", error);
        res.status(500).json({ message: error.message });
    }
});

router.patch('/admin/:id/status', isAdmin, async (req, res) => {
    try {
        const result = await borrowDAL.updateBorrowStatus(req.params.id, req.body.status, req.user.id);
        res.json(result);
    } catch (error) {
        console.error("Error in /borrows/admin/:id/status:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;