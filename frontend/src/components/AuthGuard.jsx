import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthGuard({ children }) {
    const { user } = useAuth();

    // Nếu chưa đăng nhập, chuyển về trang login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, cho phép truy cập
    return children;
}

export default AuthGuard;