import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { autocompleteSearchApi } from '../api/book.api';
import { Autocomplete, TextField, Box, Chip, CircularProgress } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import LabelIcon from '@mui/icons-material/Label';

function AutocompleteSearch() {
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }

        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            autocompleteSearchApi(inputValue)
                .then(data => setOptions(data))
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue]);

    const handleSelection = (event, value) => {
        if (!value) return;

        // Nếu người dùng chọn một gợi ý (là object)
        if (typeof value === 'object' && value.value) {
            navigate(`/search?q=${value.value}`);
        }
        // Nếu người dùng tự gõ và nhấn Enter (value là string)
        else if (typeof value === 'string') {
            navigate(`/search?q=${value}`);
        }
    };

    return (
        <Autocomplete
            freeSolo // Cho phép người dùng nhập văn bản tùy ý không có trong gợi ý
            options={options}
            loading={loading}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={handleSelection}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.value) || ''}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={`${option.type}-${option.id || option.value}`}>
                    {option.type === 'book' && <BookIcon sx={{ mr: 1.5, color: 'text.secondary' }} />}
                    {option.type === 'author' && <PersonIcon sx={{ mr: 1.5, color: 'text.secondary' }} />}
                    {option.type === 'genre' && <LabelIcon sx={{ mr: 1.5, color: 'text.secondary' }} />}
                    {option.type !== 'book' && <Chip label={option.type} size="small" sx={{ mr: 1, textTransform: 'capitalize' }} />}
                    {option.value}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Tìm kiếm sách, tác giả, thể loại..."
                    sx={{
                        '.MuiInputBase-root': { backgroundColor: 'white' },
                        '.MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' }
                    }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}

export default AutocompleteSearch;