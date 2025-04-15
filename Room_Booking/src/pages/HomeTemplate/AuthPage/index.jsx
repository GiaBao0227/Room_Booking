// src/pages/HomeTemplate/Auth/index.jsx
// Component này đóng vai trò là Route Guard, kiểm tra đăng nhập người dùng thường

import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
// *** IMPORT TỪ signInSlice (Login người dùng thường) ***
// *** Đảm bảo đường dẫn này đúng từ thư mục Auth đến thư mục Login ***
import { selectIsUserLoggedIn, selectLoginLoading } from "../Login/slice";

// Đặt tên component rõ ràng, ví dụ AuthRouteGuard hoặc ProtectedRouteLayout
const AuthRouteGuard = () => {
  // *** SỬ DỤNG SELECTOR TỪ signInSlice (state.login) ***
  const isLoggedIn = useSelector(selectIsUserLoggedIn); // Check state.login.data.token
  const isLoading = useSelector(selectLoginLoading); // Check state.login.loading
  const location = useLocation(); // Lấy vị trí hiện tại người dùng muốn vào

  // Optional: Hiển thị loading nếu trạng thái đăng nhập đang được kiểm tra
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isLoggedIn) {
    console.log(
      "[AuthRouteGuard] Người dùng chưa đăng nhập. Redirect tới /login."
    );
    // Điều hướng về trang login người dùng thường (/login)
    // Lưu lại trang muốn truy cập vào state của location để quay lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, cho phép render các route con được bọc bởi component này
  return <Outlet />; // Render component con (ví dụ: PayingPage, ProfilePage)
};

// Export component để App.jsx có thể import
export default AuthRouteGuard; // Bạn có thể đổi tên component nếu muốn
