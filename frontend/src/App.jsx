import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// User-specific Page
import MyBorrowsPage from './pages/MyBorrowsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBooksPage from './pages/AdminBooksPage';
import AdminGenresPage from './pages/AdminGenresPage';
import AdminBorrowsPage from './pages/AdminBorrowsPage';

// Route Guards
import AuthGuard from './components/AuthGuard';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CÁC ROUTE SỬ DỤNG LAYOUT CHUNG (CÓ SIDEBAR) */}
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="books/:id" element={<BookDetailPage />} />

          {/* User-specific Routes (yêu cầu đăng nhập) */}
          <Route
            path="my-borrows"
            element={<AuthGuard><MyBorrowsPage /></AuthGuard>}
          />

          {/* Admin Routes (yêu cầu quyền admin) */}
          <Route
            path="admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
          <Route
            path="admin/books"
            element={<AdminRoute><AdminBooksPage /></AdminRoute>}
          />
          <Route
            path="admin/genres"
            element={<AdminRoute><AdminGenresPage /></AdminRoute>}
          />
          <Route
            path="admin/borrows"
            element={<AdminRoute><AdminBorrowsPage /></AdminRoute>}
          />
        </Route>

        {/* CÁC ROUTE CÓ LAYOUT RIÊNG */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route trang không tồn tại phải đặt ở cuối cùng */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;