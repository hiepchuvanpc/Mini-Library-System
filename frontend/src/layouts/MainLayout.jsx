import { useState } from 'react';
import { Outlet, NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { AppBar as MuiAppBar, Toolbar, Typography, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Chip, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Import Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BookIcon from '@mui/icons-material/Book';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

// Styled component cho nội dung chính, sẽ dịch chuyển khi sidebar đóng/mở
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

// Styled component cho AppBar, sẽ thay đổi kích thước khi sidebar đóng/mở
const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(true); // Trạng thái đóng/mở sidebar

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);
    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { text: 'Trang Chủ', icon: <HomeIcon />, path: '/' },
        { text: 'Tìm kiếm Sách', icon: <SearchIcon />, path: '/search' },
        ...(user ? [{ text: 'Lịch sử Mượn', icon: <HistoryIcon />, path: '/my-borrows' }] : [])
    ];

    const adminNavItems = [
        { text: 'Bảng điều khiển', icon: <AdminPanelSettingsIcon />, path: '/admin' },
        { text: 'Quản lý Sách', icon: <BookIcon />, path: '/admin/books' },
        { text: 'Quản lý Thể loại', icon: <CategoryIcon />, path: '/admin/genres' },
        { text: 'Quản lý Mượn/Trả', icon: <PeopleIcon />, path: '/admin/borrows' },
    ];

    const drawerContent = (
      <div>
          <DrawerHeader>
              <IconButton onClick={handleDrawerClose}><ChevronLeftIcon /></IconButton>
          </DrawerHeader>
          <Divider />
          <List>{navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                  <ListItemButton component={RouterNavLink} to={item.path}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                  </ListItemButton>
              </ListItem>
          ))}</List>
          {user && user.role === 'admin' && (
              <>
                  <Divider />
                  <List><Typography variant="overline" sx={{ pl: 2 }}>Admin</Typography>
                  {adminNavItems.map((item) => (
                      <ListItem key={item.text} disablePadding>
                          <ListItemButton component={RouterNavLink} to={item.path}>
                              <ListItemIcon>{item.icon}</ListItemIcon>
                              <ListItemText primary={item.text} />
                          </ListItemButton>
                      </ListItem>
                  ))}</List>
              </>
          )}
      </div>
  );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Mini Library
                    </Typography>

                    {/* --- PHẦN BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG --- */}
                    {user ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip label={user.username} sx={{ color: 'white', mr: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                            <Button color="inherit" onClick={handleLogout}>Đăng Xuất</Button>
                        </Box>
                    ) : (
                        <Button color="inherit" component={RouterNavLink} to="/login">Đăng Nhập</Button>
                    )}
                    {/* --- KẾT THÚC PHẦN BỔ SUNG --- */}
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                {drawerContent}
            </Drawer>
            <Main open={open}>
                <DrawerHeader />
                <Outlet />
            </Main>
        </Box>
    );
}

export default MainLayout;