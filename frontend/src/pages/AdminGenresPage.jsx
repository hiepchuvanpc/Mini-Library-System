import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { getGenresApi, createGenreApi, updateGenreApi, deleteGenreApi } from '../api/genre.api';
import GenreFormModal from '../components/GenreFormModal';

function AdminGenresPage() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState(null);
    const { token } = useAuth();

    const fetchGenres = () => {
        setLoading(true);
        getGenresApi()
            .then(data => setGenres(data))
            .catch(() => setError('Không thể tải danh sách thể loại.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleOpenModal = (genre = null) => {
        setEditingGenre(genre);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGenre(null);
    };

    const handleSaveGenre = async (genreData, genreId) => {
        try {
            if (genreId) {
                await updateGenreApi(genreId, genreData, token);
            } else {
                await createGenreApi(genreData, token);
            }
            fetchGenres();
            handleCloseModal();
        } catch (err) {
            setError('Lưu thể loại thất bại.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này? Lưu ý: sách thuộc thể loại này sẽ không bị xóa.')) {
            try {
                await deleteGenreApi(id, token);
                fetchGenres();
            } catch (err) {
                setError(err.message || 'Xóa thể loại thất bại.');
            }
        }
    };

    const columns = [
        { field: 'name', headerName: 'Tên thể loại', flex: 1 },
        {
            field: 'actions',
            headerName: 'Hành động',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleOpenModal(params.row)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error"><DeleteIcon /></IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Quản lý Thể loại</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    Thêm Thể loại
                </Button>
            </Box>
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? <CircularProgress /> : (
                <Box sx={{ height: 400, width: '100%', backgroundColor: 'white' }}>
                    <DataGrid
                        rows={genres}
                        columns={columns}
                        getRowId={(row) => row.id}
                    />
                </Box>
            )}
            {isModalOpen && (
                <GenreFormModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    genre={editingGenre}
                    onSave={handleSaveGenre}
                />
            )}
        </Box>
    );
}

export default AdminGenresPage;