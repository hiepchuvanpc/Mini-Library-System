import { Typography, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function RegisterPage() {
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
          Đăng Ký
        </Typography>
        <Typography sx={{ mt: 2 }}>
          (Chức năng đăng ký sẽ được xây dựng sau)
        </Typography>
        <RouterLink to="/login" style={{ marginTop: '20px' }}>
          Quay lại trang Đăng nhập
        </RouterLink>
      </Box>
    </Container>
  );
}

export default RegisterPage;