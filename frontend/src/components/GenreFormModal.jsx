import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    name: Yup.string().required('Tên thể loại là bắt buộc'),
});

function GenreFormModal({ open, onClose, genre, onSave }) {
    const formik = useFormik({
        initialValues: {
            name: genre?.name || '',
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSave(values, genre?.id);
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>{genre ? 'Sửa Thể loại' : 'Thêm Thể loại Mới'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Tên thể loại"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained">Lưu</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default GenreFormModal;