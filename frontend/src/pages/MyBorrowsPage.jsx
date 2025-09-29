import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getMyHistoryApi, userReturnBookApi } from '../api/borrow.api';
import { useSnackbar } from 'notistack';
import ReadOnlineIcon from '@mui/icons-material/ReadMore';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

const statusMap = {
    pending: { label: 'Chờ duyệt', color: 'warning' },
    borrowing: { label: 'Đang mượn', color: 'primary' },
    returned: { label: 'Đã trả', color: 'success' },
    cancelled: { label: 'Đã hủy', color: 'default' },
    overdue: { label: 'Quá hạn', color: 'error' }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

function MyBorrowsPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const fetchHistory = () => {
        if (token) {
            setLoading(true);
            getMyHistoryApi(token)
                .then(data => setHistory(data))
                .catch(() => setError('Không thể tải lịch sử mượn.'))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const handleReturnBook = async (borrowId) => {
        try {
            await userReturnBookApi(borrowId, token);
            enqueueSnackbar('Trả sách điện tử thành công.', { variant: 'success' });
            fetchHistory();
        } catch (err) {
            enqueueSnackbar(err.message || 'Trả sách thất bại.', { variant: 'error' });
        }
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Lịch sử Mượn sách của tôi</Typography>
            {history.length === 0 ? (
                <Typography>Bạn chưa có lịch sử mượn sách.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tên sách</TableCell>
                                <TableCell>Loại</TableCell>
                                <TableCell>Ngày yêu cầu</TableCell>
                                <TableCell>Ngày hết hạn</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.title || '(Sách không còn tồn tại)'}</TableCell>
                                    <TableCell>{row.type === 'physical' ? 'Sách vật lý' : 'Sách điện tử'}</TableCell>
                                    <TableCell>{formatDate(row.request_date)}</TableCell>
                                    <TableCell>{formatDate(row.due_date)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={statusMap[row.status]?.label || row.status}
                                            color={statusMap[row.status]?.color || 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {row.type === 'digital' && row.status === 'borrowing' && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<ReadOnlineIcon />}
                                                    href={row.location_or_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Đọc
                                                </Button>
                                                <Button size="small" variant="outlined" color="secondary" startIcon={<KeyboardReturnIcon />} onClick={() => handleReturnBook(row.id)}>
                                                    Trả
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default MyBorrowsPage;