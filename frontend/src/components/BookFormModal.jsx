import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Box, Autocomplete, Chip, Typography, Alert, FormControlLabel,
    Checkbox, Collapse, IconButton, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getGenresApi, lookupIsbnApi } from '../api/book.api';

// Quy tắc xác thực cho form
const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc'),
    author: Yup.string(),
    isbn: Yup.string(),
    description: Yup.string(),
    quantity: Yup.number().min(0, 'Số lượng không thể âm'),
});

function BookFormModal({ open, onClose, book, onSave, error }) {
    const [genres, setGenres] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [ebookFile, setEbookFile] = useState(null);
    const [hasPhysical, setHasPhysical] = useState(false);
    const [lookupError, setLookupError] = useState('');

    // Lấy danh sách thể loại một lần khi component được tạo
    useEffect(() => {
        getGenresApi().then(setGenres).catch(console.error);
    }, []);

    // Reset lại trạng thái của form mỗi khi modal được mở
    useEffect(() => {
        if (open) {
            const physicalDetail = book?.details?.find(d => d.type === 'physical');
            setHasPhysical(!!physicalDetail);
            setCoverImagePreview(book?.thumbnail || null);
            setCoverImageFile(null);
            setEbookFile(null);
            setLookupError('');
        }
    }, [book, open]);

    const formik = useFormik({
        initialValues: {
            title: book?.title || '',
            author: book?.author || '',
            isbn: book?.isbn || '',
            description: book?.description || '',
            genreIds: book?.genre_ids || [],
            thumbnail: book?.thumbnail || '',
            quantity: book?.details?.find(d => d.type === 'physical')?.quantity_total || 0,
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            const formData = new FormData();

            // Xây dựng mảng details dựa trên trạng thái form
            const details = [];
            if (hasPhysical) {
                const physicalDetailFromBook = book?.details?.find(d => d.type === 'physical');
                details.push({
                    id: physicalDetailFromBook?.id || null, // Giữ lại ID nếu đang sửa
                    type: 'physical',
                    location_or_url: 'In stock',
                    quantity_total: values.quantity,
                    quantity_available: values.quantity,
                });
            }
            formData.append('details', JSON.stringify(details));

            // Append các dữ liệu text vào FormData
            formData.append('title', values.title);
            formData.append('author', values.author || 'Unknown');
            formData.append('isbn', values.isbn);
            formData.append('description', values.description);
            formData.append('genreIds', JSON.stringify(values.genreIds));

            // Chỉ gửi thumbnail từ ISBN nếu không có ảnh bìa mới được upload
            if (!coverImageFile) {
                formData.append('thumbnail', values.thumbnail);
            }

            // Append các file (nếu có)
            if (coverImageFile) {
                formData.append('coverImage', coverImageFile);
            }
            if (ebookFile) {
                formData.append('ebookFile', ebookFile);
            }

            // Gọi hàm onSave được truyền từ component cha
            onSave(formData, book?.id);
        },
    });

    // Hàm xử lý tra cứu ISBN
    const handleIsbnLookup = async () => {
        const isbn = formik.values.isbn;
        if (!isbn) {
            setLookupError('Vui lòng nhập mã ISBN để tra cứu.');
            return;
        }
        setLookupError('');
        try {
            const data = await lookupIsbnApi(isbn);
            formik.setValues({
                ...formik.values,
                title: data.title || formik.values.title,
                author: data.author || formik.values.author,
                description: data.description || formik.values.description,
                thumbnail: data.thumbnail || formik.values.thumbnail,
            });
            if (data.thumbnail) {
                setCoverImagePreview(data.thumbnail);
                setCoverImageFile(null);
            }
        } catch (err) {
            setLookupError(err.message || 'Không tìm thấy thông tin cho ISBN này.');
        }
    };

    // Hàm xử lý khi chọn ảnh bìa
    const handleCoverImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCoverImageFile(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>{book ? 'Sửa thông tin Sách' : 'Thêm Sách Mới'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField name="title" label="Tiêu đề" value={formik.values.title} onChange={formik.handleChange} error={formik.touched.title && Boolean(formik.errors.title)} helperText={formik.touched.title && formik.errors.title} fullWidth margin="normal" required />
                    <TextField name="author" label="Tác giả" value={formik.values.author} onChange={formik.handleChange} fullWidth margin="normal" placeholder="Mặc định: Unknown" />
                    <TextField
                        name="isbn"
                        label="ISBN"
                        value={formik.values.isbn}
                        onChange={formik.handleChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton aria-label="tra cứu isbn" onClick={handleIsbnLookup} edge="end">
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {lookupError && <Alert severity="warning" sx={{ mb: 1 }}>{lookupError}</Alert>}
                    <Autocomplete
                        multiple
                        options={genres}
                        getOptionLabel={(option) => option.name}
                        value={genres.filter(g => formik.values.genreIds.includes(g.id))}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(event, newValue) => formik.setFieldValue('genreIds', newValue.map(g => g.id))}
                        renderInput={(params) => <TextField {...params} label="Thể loại" margin="normal" />}
                    />
                    <TextField name="description" label="Mô tả" value={formik.values.description} onChange={formik.handleChange} fullWidth multiline rows={4} margin="normal" />
                    <FormControlLabel
                        control={<Checkbox checked={hasPhysical} onChange={(e) => setHasPhysical(e.target.checked)} />}
                        label="Có phiên bản sách vật lý?"
                    />
                    <Collapse in={hasPhysical}>
                        <TextField fullWidth margin="dense" name="quantity" label="Số lượng trong kho" type="number" value={formik.values.quantity} onChange={formik.handleChange} error={formik.touched.quantity && Boolean(formik.errors.quantity)} helperText={formik.touched.quantity && formik.errors.quantity} />
                    </Collapse>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        {coverImagePreview && <img src={coverImagePreview} alt="Cover Preview" style={{ height: '100px', width: 'auto', objectFit: 'cover', borderRadius: '4px' }} />}
                        <Button variant="outlined" component="label">Tải ảnh bìa <input type="file" hidden accept="image/*" onChange={handleCoverImageChange} /></Button>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" component="label">
                            Tải Ebook {book?.details.find(d => d.type === 'digital') ? '(Thay thế file cũ)' : ''}
                            <input type="file" hidden onChange={(e) => setEbookFile(e.target.files[0])} />
                        </Button>
                        {ebookFile && <Typography variant="body2" sx={{ml: 2, display: 'inline'}}>{ebookFile.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained">Lưu</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default BookFormModal;