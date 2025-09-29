import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function BookCard({ book }) {
    // Ảnh bìa mặc định nếu sách không có ảnh
    const placeholderImage = 'https://via.placeholder.com/128x192.png?text=No+Cover';

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                }
            }}
        >
            {/* Bọc toàn bộ nội dung trong CardActionArea để biến nó thành một liên kết */}
            <CardActionArea
                component={RouterLink}
                to={`/books/${book.id}`}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start' // Đẩy nội dung lên trên cùng
                }}
            >
                <CardMedia
                    component="img"
                    sx={{
                        alignSelf: 'center',
                        width: 'auto',
                        height: 192, // Chiều cao cố định cho ảnh
                        objectFit: 'contain',
                        mt: 2
                    }}
                    image={book.thumbnail || placeholderImage}
                    alt={book.title}
                />
                <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                    <Typography gutterBottom variant="h6" component="div"
                        sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2, // Giới hạn title trong 2 dòng
                            minHeight: '3em', // Giữ chiều cao ổn định cho title
                            lineHeight: '1.5em'
                        }}
                    >
                        {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {book.author}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

export default BookCard;