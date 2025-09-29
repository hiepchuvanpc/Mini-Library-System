import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box, FormControlLabel, Checkbox, Collapse } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { requestBorrowApi } from '../api/borrow.api';
import { useSnackbar } from 'notistack';

function BorrowRequestModal({ open, onClose, book, onSuccess }) {
    const { token } = useAuth();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [borrowPhysical, setBorrowPhysical] = useState(false);
    const [borrowDigital, setBorrowDigital] = useState(false);
    const [pickupDate, setPickupDate] = useState(dayjs().add(1, 'day'));
    const [durationDays, setDurationDays] = useState(14);

    const physicalCopy = book?.details?.find(d => d.type === 'physical');
    const digitalCopy = book?.details?.find(d => d.type === 'digital');

    useEffect(() => {
        if(open) {
            setBorrowPhysical(false);
            setBorrowDigital(false);
        }
    }, [open]);

    const handleConfirmBorrow = async () => {
        setLoading(true);
        const borrowItems = [];
        if (borrowPhysical && physicalCopy) {
            borrowItems.push({
                bookDetailId: physicalCopy.id,
                type: 'physical',
                pickupDate: pickupDate.format('YYYY-MM-DD'),
                durationDays
            });
        }
        if (borrowDigital && digitalCopy) {
            borrowItems.push({
                bookDetailId: digitalCopy.id,
                type: 'digital',
                durationDays
            });
        }
        if (borrowItems.length === 0) {
            enqueueSnackbar('Bạn chưa chọn phiên bản sách để mượn.', { variant: 'warning' });
            setLoading(false);
            return;
        }

        try {
            const result = await requestBorrowApi({ borrowItems }, token);
            enqueueSnackbar(result.message, { variant: 'success' });

            // Sửa lại: Gửi tín hiệu về trạng thái mới
            const newStatus = borrowDigital ? 'borrowing' : 'pending';
            onSuccess(newStatus);

            onClose();
        } catch (err) {
            enqueueSnackbar(err.message || 'Yêu cầu thất bại', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Đăng ký Mượn sách</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Vui lòng chọn phiên bản và thời gian mượn.
                </Typography>
                {physicalCopy ? (
                    <FormControlLabel
                        control={<Checkbox checked={borrowPhysical} onChange={(e) => setBorrowPhysical(e.target.checked)} />}
                        label={`Sách vật lý (Còn ${physicalCopy.quantity_available} quyển)`}
                        disabled={physicalCopy.quantity_available <= 0}
                    />
                ) : <Typography variant="body2" color="text.secondary">Không có phiên bản sách vật lý.</Typography>}
                <Collapse in={borrowPhysical}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, pl: 2, borderLeft: '2px solid #eee' }}>
                        <DatePicker
                            label="Ngày hẹn lấy sách"
                            value={pickupDate}
                            onChange={(newValue) => setPickupDate(newValue)}
                            minDate={dayjs().add(1, 'day')}
                            maxDate={dayjs().add(3, 'day')}
                        />
                    </Box>
                </Collapse>
                {digitalCopy ? (
                     <FormControlLabel
                        sx={{ mt: 1, display: 'block' }}
                        control={<Checkbox checked={borrowDigital} onChange={(e) => setBorrowDigital(e.target.checked)} />}
                        label="Sách điện tử (Có sẵn)"
                    />
                ) : <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>Không có phiên bản sách điện tử.</Typography>}
                {(borrowPhysical || borrowDigital) && (
                    <TextField
                        sx={{mt: 2}}
                        fullWidth
                        label="Số ngày mượn"
                        type="number"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        InputProps={{ inputProps: { min: 1, max: 30 } }}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Hủy</Button>
                <Button onClick={handleConfirmBorrow} variant="contained" disabled={loading || (!borrowPhysical && !borrowDigital)}>
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BorrowRequestModal;