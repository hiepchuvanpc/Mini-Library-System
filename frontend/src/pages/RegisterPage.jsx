import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerApi } from '../api/auth.api';
import { useSnackbar } from 'notistack';
import { Container, Box, Typography, TextField, Button, Alert, Link } from '@mui/material';

// Quy tắc xác thực
const validationSchema = Yup.object({
    username: Yup.string()
        .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
        .required('Tên đăng nhập là bắt buộc'),
    email: Yup.string()
        .email('Email không hợp lệ')
        .required('Email là bắt buộc'),
    password: Yup.string()
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
        .required('Mật khẩu là bắt buộc'),
});

function RegisterPage() {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setError('');
            try {
                await registerApi(values);
                enqueueSnackbar('Đăng ký thành công! Vui lòng đăng nhập.', { variant: 'success' });
                navigate('/login');
            } catch (err) {
                setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Tạo tài khoản
                </Typography>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Tên đăng nhập"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Địa chỉ Email"
                        name="email"
                        autoComplete="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mật khẩu"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Đang xử lý...' : 'Đăng Ký'}
                    </Button>
                    <Typography variant="body2" align="center">
                        Đã có tài khoản?{' '}
                        <Link component={RouterLink} to="/login" variant="body2">
                            Đăng nhập
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
}

export default RegisterPage;