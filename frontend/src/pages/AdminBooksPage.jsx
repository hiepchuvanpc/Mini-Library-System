import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { getAllBooksAdminApi, deleteBookApi, createBookApi, updateBookApi, getBookByIdApi } from '../api/book.api';
import BookFormModal from '../components/BookFormModal';

// Đổi tên component cho đúng với tên file
function AdminBooksPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const { token } = useAuth();

    const fetchBooks = () => {
        setLoading(true);
        getAllBooksAdminApi(token)
            .then(data => setBooks(data))
            .catch((err) => setError(err.message || 'Không thể tải danh sách sách.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleOpenModal = async (bookSummary = null) => {
        setError('');
        if (!bookSummary) {
            setEditingBook(null);
            setIsModalOpen(true);
        } else {
            try {
                const fullBookData = await getBookByIdApi(bookSummary.id);
                setEditingBook(fullBookData);
                setIsModalOpen(true);
            } catch (err) {
                setError('Không thể tải dữ liệu chi tiết của sách.');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBook(null);
    };

    const handleSaveBook = async (formData, bookId) => {
        try {
            setError('');
            if (bookId) {
                await updateBookApi(bookId, formData, token);
            } else {
                await createBookApi(formData, token);
            }
            fetchBooks();
            handleCloseModal();
        } catch (err) {
            console.error("Save book failed:", err);
            setError(err.message || 'Lưu sách thất bại. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) {
            try {
                await deleteBookApi(id, token);
                fetchBooks();
            } catch (err) {
                console.error("Delete book failed:", err);
                setError(err.message || 'Xóa sách thất bại.');
            }
        }
    };

    const columns = [
        {
            field: 'thumbnail', headerName: 'Ảnh bìa', width: 80, sortable: false,
            renderCell: (params) => (
                <img src={params.value || 'https://via.placeholder.com/50x75'} alt="cover" style={{ height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
            )
        },
        { field: 'title', headerName: 'Tiêu đề', width: 300 },
        { field: 'author', headerName: 'Tác giả', width: 200 },
        { field: 'isbn', headerName: 'ISBN', width: 150 },
        {
            field: 'actions', headerName: 'Hành động', width: 120, sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenModal(params.row)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error"><DeleteIcon /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: 650, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Quản lý Sách</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Thêm Sách Mới
                </Button>
            </Box>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? <CircularProgress /> : (
                <DataGrid
                    rows={books}
                    columns={columns}
                    getRowId={(row) => row.id}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    rowHeight={60}
                    sx={{ backgroundColor: 'white' }}
                />
            )}

            {isModalOpen && (
                <BookFormModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    book={editingBook}
                    onSave={handleSaveBook}
                    error={error}
                />
            )}
        </Box>
    );
}

export default AdminBooksPage; // <-- Đổi tên export