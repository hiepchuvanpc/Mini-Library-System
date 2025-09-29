import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Box, Typography, Chip, Button, CircularProgress, Alert, Divider, Tooltip } from '@mui/material';
import { getBookByIdApi } from '../api/book.api';
import { getMyHistoryApi } from '../api/borrow.api';
import { useAuth } from '../context/AuthContext';
import BorrowRequestModal from '../components/BorrowRequestModal';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BookOnlineIcon from '@mui/icons-material/BookOnline';

function BookDetailPage() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const [book, setBook] = useState(null);
    const [borrowingStatus, setBorrowingStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const bookData = await getBookByIdApi(id);
                setBook(bookData);

                if (token) {
                    const historyData = await getMyHistoryApi(token);
                    const borrowedItem = historyData.find(item =>
                        bookData.details.some(d => d.id === item.book_detail_id) &&
                        (item.status === 'borrowing' || item.status === 'pending')
                    );
                    if (borrowedItem) {
                        setBorrowingStatus(borrowedItem.status);
                    } else {
                        setBorrowingStatus(null);
                    }
                }
            } catch (err) {
                setError('Không thể tải thông tin sách.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, token]);

    // Hàm được gọi khi mượn sách thành công từ Modal
    const handleBorrowSuccess = () => {
        // Cập nhật trạng thái ngay lập tức mà không cần tải lại trang
        setBorrowingStatus('pending');
    };

    const physicalCopy = book?.details?.find(d => d.type === 'physical');
    const digitalCopy = book?.details?.find(d => d.type === 'digital');

    const renderBorrowButton = () => {
        let buttonProps = {
            variant: "contained",
            size: "large",
            sx: { mt: 2 },
            disabled: true,
            children: "Đăng ký Mượn sách"
        };
        let tooltipTitle = "";

        if (borrowingStatus === 'borrowing') {
            buttonProps.children = "Bạn đang mượn sách này";
        } else if (borrowingStatus === 'pending') {
            buttonProps.children = "Yêu cầu đang chờ duyệt";
        } else if (!user) {
            buttonProps.children = "Đăng nhập để mượn sách";
            tooltipTitle = "Bạn cần đăng nhập để thực hiện chức năng này.";
        } else if (user.account_status === 'locked') {
            buttonProps.children = "Tài khoản bị khóa";
            tooltipTitle = "Tài khoản của bạn bị khóa do có sách quá hạn.";
        } else if (!physicalCopy && !digitalCopy) {
            buttonProps.children = "Sách không có sẵn";
        } else if (physicalCopy?.quantity_available <= 0 && !digitalCopy) {
            buttonProps.children = "Đã hết sách";
        } else {
            buttonProps.disabled = false;
            buttonProps.onClick = () => setIsModalOpen(true);
        }

        return (
            <Tooltip title={tooltipTitle}>
                <span>
                    <Button {...buttonProps} />
                </span>
            </Tooltip>
        );
    };

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!book) return <Typography>Không tìm thấy sách.</Typography>;

    return (
        <>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid xs={12} md={4}>
                        <Box component="img" src={book.thumbnail || 'https://via.placeholder.com/300x450'} alt={book.title} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}/>
                    </Grid>
                    <Grid xs={12} md={8}>
                        <Typography variant="h3" component="h1" gutterBottom>{book.title}</Typography>
                        <Typography variant="h5" color="text.secondary" gutterBottom>{book.author}</Typography>
                        <Box sx={{ my: 2 }}>{book.genres?.split(',').map(genre => (<Chip key={genre} label={genre.trim()} sx={{ mr: 1, mb: 1 }} />))}</Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body1" paragraph>{book.description}</Typography>
                        <Divider sx={{ my: 2 }} />
                        {physicalCopy && (<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AutoStoriesIcon sx={{ mr: 1 }} />
                            <Typography>Sách vật lý: <strong>Còn {physicalCopy.quantity_available} / {physicalCopy.quantity_total}</strong> quyển</Typography>
                        </Box>)}
                        {digitalCopy && (<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <BookOnlineIcon sx={{ mr: 1 }} />
                            <Typography>Sách điện tử: <strong>Có sẵn</strong></Typography>
                        </Box>)}

                        {renderBorrowButton()}

                    </Grid>
                </Grid>
            </Container>

            <BorrowRequestModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                book={book}
                onSuccess={handleBorrowSuccess}
            />
        </>
    );
}

export default BookDetailPage;