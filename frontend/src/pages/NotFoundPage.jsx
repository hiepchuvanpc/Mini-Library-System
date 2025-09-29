import { Typography, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NotFoundPage() {
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
        <Typography component="h1" variant="h4" gutterBottom>
          404 - Không tìm thấy trang
        </Typography>
        <RouterLink to="/">
          Quay về Trang chủ
        </RouterLink>
      </Box>
    </Container>
  );
}

export default NotFoundPage;