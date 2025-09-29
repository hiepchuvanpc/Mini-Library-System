const { pool } = require('../config/database');

// Các hàm requestBorrow, updateBorrowStatus, userReturnBook, getHistoryForUser, getAllBorrowRequests
// không thay đổi so với phiên bản trước, giữ nguyên để đảm bảo tính toàn vẹn.

const requestBorrow = async (userId, borrowItems) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.query('SELECT account_status FROM users WHERE id = ?', [userId]);
        if (users.length > 0 && users[0].account_status === 'locked') {
            throw new Error('Tài khoản của bạn đã bị khóa do có sách mượn quá hạn. Vui lòng trả sách để tiếp tục.');
        }
        for (const item of borrowItems) {
            const [existingBorrows] = await connection.query(
                `SELECT bh.id FROM borrowing_history bh
                 JOIN book_details bd ON bh.book_detail_id = bd.id
                 WHERE bh.user_id = ? AND bd.book_id = (SELECT book_id FROM book_details WHERE id = ?) AND bh.status IN ('pending', 'borrowing', 'overdue')`,
                [userId, item.bookDetailId]
            );
            if (existingBorrows.length > 0) {
                throw new Error('Bạn đã mượn hoặc đang có yêu cầu chờ duyệt cho cuốn sách này.');
            }
        }
        const requestDate = new Date();
        for (const item of borrowItems) {
            const [details] = await connection.query(
                `SELECT bd.quantity_available, bd.type, b.title
                 FROM book_details bd
                 JOIN books b ON bd.book_id = b.id
                 WHERE bd.id = ? FOR UPDATE`,
                [item.bookDetailId]
            );
            if (details.length === 0) throw new Error(`Không tìm thấy phiên bản sách với ID ${item.bookDetailId}.`);
            const detail = details[0];
            const bookTitle = detail.title;
            const bookType = detail.type;
            if (detail.type === 'physical') {
                const pickupDate = new Date(item.pickupDate);
                const today = new Date();
                const maxDate = new Date();
                maxDate.setDate(today.getDate() + 3);
                today.setHours(0, 0, 0, 0);
                pickupDate.setHours(0, 0, 0, 0);
                maxDate.setHours(0, 0, 0, 0);

                if (pickupDate <= today || pickupDate > maxDate) {
                    throw new Error('Ngày hẹn lấy sách phải trong vòng 3 ngày tới.');
                }
                if (detail.quantity_available <= 0) throw new Error('Sách vật lý đã hết.');

                await connection.query('UPDATE book_details SET quantity_available = quantity_available - 1 WHERE id = ?', [item.bookDetailId]);
                const dueDate = new Date(item.pickupDate);
                dueDate.setDate(dueDate.getDate() + parseInt(item.durationDays, 10));
                await connection.query(
                    'INSERT INTO borrowing_history (user_id, book_detail_id, book_title_snapshot, type_snapshot, request_date, borrow_date, due_date, duration_days, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, item.bookDetailId, bookTitle, bookType, requestDate, item.pickupDate, dueDate, item.durationDays, 'pending']
                );
            } else if (detail.type === 'digital') {
                const borrowDate = new Date();
                const dueDate = new Date();
                dueDate.setDate(borrowDate.getDate() + parseInt(item.durationDays, 10));
                await connection.query(
                    'INSERT INTO borrowing_history (user_id, book_detail_id, book_title_snapshot, type_snapshot, request_date, borrow_date, due_date, duration_days, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, item.bookDetailId, bookTitle, bookType, requestDate, borrowDate, dueDate, item.durationDays, 'borrowing']
                );
            }
        }
        await connection.commit();
        const physicalRequest = borrowItems.find(i => i.type === 'physical');
        const message = physicalRequest
            ? `Đăng ký mượn thành công. Lịch lấy sách của bạn là ngày ${new Date(physicalRequest.pickupDate).toLocaleDateString()}.`
            : 'Mượn sách điện tử thành công.';
        return { success: true, message };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const updateBorrowStatus = async (borrowId, newStatus, adminId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [borrowRes] = await connection.query(
            `SELECT bh.*, COALESCE(bd.type, bh.type_snapshot) as type
             FROM borrowing_history bh
             LEFT JOIN book_details bd ON bh.book_detail_id = bd.id
             WHERE bh.id = ? FOR UPDATE`,
            [borrowId]
        );
        if (borrowRes.length === 0) throw new Error('Không tìm thấy yêu cầu mượn.');
        const borrow = borrowRes[0];
        let query = 'UPDATE borrowing_history SET status = ?';
        const params = [newStatus];
        if (newStatus === 'borrowing') {
            query += ', borrow_date = ?, approved_by_pickup = ?';
            params.push(new Date());
            params.push(adminId);
        } else if (newStatus === 'returned') {
            query += ', return_date = ?, approved_by_return = ?';
            params.push(new Date());
            params.push(adminId);

            if (borrow.type === 'physical') {
                await connection.query('UPDATE book_details SET quantity_available = quantity_available + 1 WHERE id = ?', [borrow.book_detail_id]);
            }
            const userId = borrow.user_id;
            const [overdueBooks] = await connection.query("SELECT id FROM borrowing_history WHERE user_id = ? AND status = 'overdue' AND id != ?", [userId, borrowId]);
            if (overdueBooks.length === 0) {
                await connection.query("UPDATE users SET account_status = 'active' WHERE id = ?", [userId]);
            }
        } else if (newStatus === 'cancelled') {
            if (borrow.status === 'pending' && borrow.type === 'physical') {
                await connection.query('UPDATE book_details SET quantity_available = quantity_available + 1 WHERE id = ?', [borrow.book_detail_id]);
            }
        }
        query += ' WHERE id = ?';
        params.push(borrowId);
        await connection.query(query, params);
        await connection.commit();
        return { success: true, message: 'Cập nhật trạng thái thành công.' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const userReturnBook = async (borrowId, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [borrowRes] = await connection.query(
            `SELECT bh.*, COALESCE(bd.type, bh.type_snapshot) as type
             FROM borrowing_history bh
             LEFT JOIN book_details bd ON bh.book_detail_id = bd.id
             WHERE bh.id = ? AND bh.user_id = ? FOR UPDATE`,
            [borrowId, userId]
        );
        if (borrowRes.length === 0) throw new Error('Không tìm thấy yêu cầu mượn này.');
        const borrow = borrowRes[0];
        if (borrow.status !== 'borrowing' && borrow.status !== 'overdue') {
            throw new Error('Không thể trả sách không ở trạng thái "Đang mượn" hoặc "Quá hạn".');
        }
        await connection.query(
            'UPDATE borrowing_history SET status = ?, return_date = ? WHERE id = ?',
            ['returned', new Date(), borrowId]
        );
        if (borrow.type === 'physical') {
            await connection.query(
                'UPDATE book_details SET quantity_available = quantity_available + 1 WHERE id = ?',
                [borrow.book_detail_id]
            );
        }
        const [overdueBooks] = await connection.query(
            "SELECT id FROM borrowing_history WHERE user_id = ? AND status = 'overdue' AND id != ?",
            [userId, borrowId]
        );
        if (overdueBooks.length === 0) {
            await connection.query("UPDATE users SET account_status = 'active' WHERE id = ?", [userId]);
        }
        await connection.commit();
        return { success: true, message: 'Trả sách thành công.' };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getHistoryForUser = async (userId) => {
    const query = `
        SELECT
            bh.id, bh.status, bh.request_date, bh.borrow_date, bh.due_date, bh.return_date,
            COALESCE(b.title, bh.book_title_snapshot, '(Sách đã bị xóa)') AS title,
            COALESCE(bd.type, bh.type_snapshot) AS type,
            b.thumbnail,
            bd.location_or_url
        FROM borrowing_history bh
        LEFT JOIN book_details bd ON bh.book_detail_id = bd.id
        LEFT JOIN books b ON bd.book_id = b.id
        WHERE bh.user_id = ?
        ORDER BY bh.request_date DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
};

// === HÀM ĐƯỢC CẬP NHẬT ĐỂ LẤY TÁC GIẢ ĐÚNG CÁCH ===
const getCurrentBorrowsForUser = async (userId) => {
    const getAuthorString = `(SELECT GROUP_CONCAT(a.name SEPARATOR ', ') FROM authors a JOIN book_authors ba ON a.id = ba.author_id WHERE ba.book_id = b.id)`;
    const query = `
        SELECT
            bh.id, bh.due_date, bh.status,
            b.id as bookId, b.title, b.thumbnail,
            ${getAuthorString} as author,
            bd.type, bd.location_or_url
        FROM borrowing_history bh
        JOIN book_details bd ON bh.book_detail_id = bd.id
        JOIN books b ON bd.book_id = b.id
        WHERE bh.user_id = ?
          AND bh.status IN ('borrowing', 'overdue')
        ORDER BY bh.borrow_date DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
};

// === HÀM ĐƯỢC CẬP NHẬT ĐỂ LẤY TÁC GIẢ ĐÚNG CÁCH ===
const getReturnedHistoryForUser = async (userId) => {
    const getAuthorString = `(SELECT GROUP_CONCAT(a.name SEPARATOR ', ') FROM authors a JOIN book_authors ba ON a.id = ba.author_id WHERE ba.book_id = b.id)`;
    const query = `
        SELECT DISTINCT
            b.id, b.title, b.thumbnail,
            ${getAuthorString} as author
        FROM borrowing_history bh
        JOIN book_details bd ON bh.book_detail_id = bd.id
        JOIN books b ON bd.book_id = b.id
        WHERE bh.user_id = ?
          AND bh.status = 'returned'
        ORDER BY bh.return_date DESC
        LIMIT 10
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
};

const getAllBorrowRequests = async () => {
    const query = `
        SELECT
            bh.id, bh.status, bh.request_date, bh.borrow_date, bh.due_date, bh.return_date,
            COALESCE(b.title, bh.book_title_snapshot, '(Sách đã bị xóa)') AS title,
            COALESCE(bd.type, bh.type_snapshot) AS type,
            u.username
        FROM borrowing_history bh
        LEFT JOIN book_details bd ON bh.book_detail_id = bd.id
        LEFT JOIN books b ON bd.book_id = b.id
        LEFT JOIN users u ON bh.user_id = u.id
        ORDER BY bh.request_date DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

module.exports = {
    requestBorrow,
    updateBorrowStatus,
    getHistoryForUser,
    getAllBorrowRequests,
    userReturnBook,
    getCurrentBorrowsForUser,
    getReturnedHistoryForUser
};