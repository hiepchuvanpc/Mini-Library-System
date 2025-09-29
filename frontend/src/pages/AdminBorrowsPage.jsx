import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../context/AuthContext';
import { getAllBorrowsAdminApi, updateBorrowStatusApi } from '../api/borrow.api';
import { useSnackbar } from 'notistack';

const statusMap = {
    pending: { label: 'Chờ duyệt', color: 'warning' },
    borrowing: { label: 'Đang mượn', color: 'primary' },
    returned: { label: 'Đã trả', color: 'success' },
    cancelled: { label: 'Đã hủy', color: 'default' },
    overdue: { label: 'Quá hạn', color: 'error' }
};

function AdminBorrowsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();

    const fetchRequests = () => {
        setLoading(true);
        getAllBorrowsAdminApi(token)
            .then(data => setRequests(data))
            .catch(() => setError('Không thể tải danh sách yêu cầu.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (token) {
            fetchRequests();
        }
    }, [token]);

    const handleStatusUpdate = (id, status) => {
        updateBorrowStatusApi(id, status, token)
            .then(() => {
                enqueueSnackbar('Cập nhật trạng thái thành công', { variant: 'success' });
                fetchRequests();
            })
            .catch((err) => enqueueSnackbar(err.message || 'Cập nhật trạng thái thất bại', { variant: 'error' }));
    };

    const columns = [
        {
            field: 'title',
            headerName: 'Sách',
            flex: 1,
            // SỬA LỖI: Chuyển từ valueGetter sang renderCell
            renderCell: (params) => params.row.title || '(Sách đã xóa)'
        },
        {
            field: 'username',
            headerName: 'Người mượn',
            width: 150,
            // SỬA LỖI: Chuyển từ valueGetter sang renderCell
            renderCell: (params) => params.row.username || '(N/A)'
        },
        {
            field: 'request_date',
            headerName: 'Ngày yêu cầu',
            width: 180,
            renderCell: (params) => {
                return params.value ? new Date(params.value).toLocaleString('vi-VN') : 'N/A';
            }
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={statusMap[params.value]?.label || params.value}
                    color={statusMap[params.value]?.color || 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Hành động',
            width: 250,
            sortable: false,
            renderCell: (params) => {
                const { id, status, type } = params.row;
                if (type === 'physical') {
                    return (
                        <Box>
                            {status === 'pending' && (
                                <>
                                    <Button size="small" variant="contained" onClick={() => handleStatusUpdate(id, 'borrowing')}>Duyệt Mượn</Button>
                                    <Button size="small" color="secondary" sx={{ml: 1}} onClick={() => handleStatusUpdate(id, 'cancelled')}>Hủy</Button>
                                </>
                            )}
                            {status === 'borrowing' && (
                                <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate(id, 'returned')}>Xác nhận Trả</Button>
                            )}
                        </Box>
                    );
                }
                return <Typography variant="caption" color="text.secondary">Tự động</Typography>;
            }
        },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>Quản lý Mượn/Trả sách</Typography>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? <CircularProgress /> : (
                <Box sx={{ height: 600, width: '100%', backgroundColor: 'white' }}>
                    <DataGrid
                        rows={requests}
                        columns={columns}
                        getRowId={(row) => row.id}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 20, 50]}
                    />
                </Box>
            )}
        </Box>
    );
}

export default AdminBorrowsPage;