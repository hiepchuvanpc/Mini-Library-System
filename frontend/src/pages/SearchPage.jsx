import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Typography, Container, Grid, Box, CircularProgress, Paper, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { motion } from 'framer-motion';
import { getGenresApi, advancedSearchApi } from '../api/book.api';
import BookCard from '../components/BookCard';

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // State cho bộ lọc và kết quả
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState(searchParams.getAll('genres') || []);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy danh sách thể loại khi trang được tải lần đầu
    useEffect(() => {
        getGenresApi().then(setGenres).catch(console.error);
    }, []);

    // Thực hiện tìm kiếm khi bộ lọc thay đổi
    useEffect(() => {
        setLoading(true);
        const params = {
            q: searchParams.get('q') || '',
            genres: selectedGenres.join(',')
        };

        advancedSearchApi(params)
            .then(setBooks)
            .catch(console.error)
            .finally(() => setLoading(false));

        // Cập nhật URL để người dùng có thể chia sẻ link tìm kiếm
        setSearchParams(params, { replace: true });

    }, [selectedGenres, searchParams, setSearchParams]);

    const handleGenreChange = (event) => {
        const { value, checked } = event.target;
        setSelectedGenres(prev =>
            checked ? [...prev, value] : prev.filter(id => id !== value)
        );
    };

    return (
        <Container maxWidth="xl">
            <Grid container spacing={4} sx={{ mt: 2 }}>
                {/* CỘT BỘ LỌC */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={2} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Bộ lọc</Typography>
                        <Typography variant="subtitle1" gutterBottom>Thể loại</Typography>
                        <FormGroup>
                            {genres.map(genre => (
                                <FormControlLabel
                                    key={genre.id}
                                    control={
                                        <Checkbox
                                            checked={selectedGenres.includes(String(genre.id))}
                                            onChange={handleGenreChange}
                                            value={genre.id}
                                        />
                                    }
                                    label={genre.name}
                                />
                            ))}
                        </FormGroup>
                    </Paper>
                </Grid>

                {/* CỘT KẾT QUẢ */}
                <Grid item xs={12} md={9}>
                    <Typography variant="h4">
                        Kết quả tìm kiếm cho: "{searchParams.get('q') || 'Tất cả sách'}"
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <motion.div layout>
                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                {books.length > 0 ? books.map(book => (
                                    <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ type: 'spring' }}
                                        >
                                            <BookCard book={book} />
                                        </motion.div>
                                    </Grid>
                                )) : (
                                    <Typography sx={{ ml: 2, mt: 2 }}>
                                        Không tìm thấy sách nào phù hợp với tiêu chí của bạn.
                                    </Typography>
                                )}
                            </Grid>
                        </motion.div>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
}

export default SearchPage;