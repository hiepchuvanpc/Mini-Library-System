import Slider from 'react-slick';
import { Box, Typography, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BookCard from './BookCard';

function BookCarousel({ title, books = [], linkTo = "/search" }) {
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 4 } },
            { breakpoint: 900, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 2 } },
        ],
    };

    return (
        <Box sx={{ my: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                    {title}
                </Typography>
                <IconButton component={RouterLink} to={linkTo} size="small">
                    <Typography variant="body2" sx={{ mr: 0.5 }}>Xem tất cả</Typography>
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </Box>
            {books.length > 0 ? (
                <Slider {...settings}>
                    {books.map(book => (
                        <Box key={book.id} sx={{ p: 1 }}>
                            <BookCard book={book} />
                        </Box>
                    ))}
                </Slider>
            ) : (
                <Typography>Chưa có sách để hiển thị.</Typography>
            )}
        </Box>
    );
}

export default BookCarousel;