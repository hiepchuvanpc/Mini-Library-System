import { Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BookIcon from '@mui/icons-material/Book';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';

function AdminDashboard() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Bảng điều khiển Admin
      </Typography>
      <Paper elevation={2}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/admin/books">
              <ListItemIcon><BookIcon /></ListItemIcon>
              <ListItemText primary="Quản lý Sách" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/admin/genres">
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Quản lý Thể loại" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/admin/borrows">
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Quản lý Mượn/Trả" />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>
    </>
  );
}

export default AdminDashboard;