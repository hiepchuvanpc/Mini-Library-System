const cron = require('node-cron');
const { pool } = require('../config/database');

const startScheduledTasks = () => {
    console.log('⏰ Scheduled tasks started. Daily check will run at 1:00 AM.');

    cron.schedule('0 1 * * *', async () => {
        console.log('Running daily check for overdue books...');
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const today = new Date();

            // 1. Tự động trả sách điện tử quá hạn
            // Sửa lại: Thêm JOIN để lấy type
            await connection.query(
                `UPDATE borrowing_history bh
                 JOIN book_details bd ON bh.book_detail_id = bd.id
                 SET bh.status = 'returned', bh.return_date = ?
                 WHERE bh.status = 'borrowing' AND bd.type = 'digital' AND bh.due_date < ?`,
                [today, today]
            );

            // 2. Cập nhật trạng thái 'overdue' cho sách vật lý quá hạn
            // Sửa lại: Thêm JOIN để lấy type
            await connection.query(
                `UPDATE borrowing_history bh
                 JOIN book_details bd ON bh.book_detail_id = bd.id
                 SET bh.status = 'overdue'
                 WHERE bh.status = 'borrowing' AND bd.type = 'physical' AND bh.due_date < ?`,
                [today]
            );

            // 3. Khóa tài khoản của những người dùng có sách vật lý quá hạn
            const [usersToLock] = await connection.query(
                `SELECT DISTINCT user_id FROM borrowing_history WHERE status = 'overdue'`
            );
            if (usersToLock.length > 0) {
                const userIds = usersToLock.map(u => u.user_id);
                await connection.query("UPDATE users SET account_status = 'locked' WHERE id IN (?)", [userIds]);
                console.log(`Locked ${userIds.length} user account(s).`);
            }

            await connection.commit();
            console.log('✅ Daily check completed successfully.');
        } catch (error) {
            await connection.rollback();
            console.error('Error during daily scheduled check:', error);
        } finally {
            connection.release();
        }
    });
};

module.exports = { startScheduledTasks };