import { useState, useEffect } from 'react';
import { advancedSearchApi } from '../api/book.api';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import AutocompleteSearch from '../components/AutocompleteSearch'; // <-- Import component đúng
import BookCarousel from '../components/BookCarousel';

function HomePage() {
    const [newBooks, setNewBooks] = useState([]);
    const [fictionBooks, setFictionBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomePageBooks = async () => {
            setLoading(true);
            try {
                // Lấy 8 cuốn sách mới nhất
                const newBooksPromise = advancedSearchApi({ sortBy: 'createdAt', order: 'desc', limit: 8 });
                // Lấy 8 cuốn sách thuộc thể loại 'Tiểu thuyết' (giả sử ID là 1)
                const fictionBooksPromise = advancedSearchApi({ genres: '1', limit: 8 });

                const [newBooksData, fictionBooksData] = await Promise.all([newBooksPromise, fictionBooksPromise]);

                setNewBooks(newBooksData);
                setFictionBooks(fictionBooksData);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomePageBooks();
    }, []);

    return (
        <>
            {/* --- HERO BANNER & SEARCH --- */}
            <Box
                sx={{
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 8, md: 12 },
                    background: 'linear-gradient(to right, #1976d2, #64b5f6)',
                    color: 'white',
                    textAlign: 'center'
                }}
            >
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                        Thư viện của Tri thức
                    </Typography>
                    <Typography variant="h5" color="inherit" sx={{ mb: 4 }}>
                        Tìm kiếm trong hàng ngàn đầu sách, tác giả và thể loại.
                    </Typography>
                    <AutocompleteSearch /> {/* <-- Sử dụng component đã import */}
                </Container>
            </Box>

            {/* --- CÁC PHẦN HIỂN THỊ SÁCH --- */}
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <BookCarousel
                            title="Sách Mới Nhất"
                            books={newBooks}
                            linkTo="/search?sortBy=newest"
                        />
                        <BookCarousel
                            title="Nổi bật: Tiểu thuyết"
                            books={fictionBooks}
                            linkTo="/search?genres=1"
                        />
                    </>
                )}
            </Container>
        </>
    );
}

export default HomePage;