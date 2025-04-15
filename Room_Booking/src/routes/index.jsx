// /Room_Booking/src/routes/index.jsx
import { Route } from "react-router-dom";
import HomeTemplate from "../pages/HomeTemplate"; // Layout chính
import RoomList from "../pages/HomeTemplate/RoomList";
import RoomLocation from "../pages/HomeTemplate/RoomLocation";
import DetailRoom from "../pages/HomeTemplate/DetailRoom";
import HomePage from "../pages/HomeTemplate/HomePage";
import LocationList from "../pages/HomeTemplate/LocationList";
import Paying from "../pages/HomeTemplate/Paying"; // *** IMPORT COMPONENT PAYING ***
import PaymentSuccess from "../pages/PaymentResult/PaymentSuccess"; // *** IMPORT COMPONENT SUCCESS ***
import PaymentFailed from "../pages/PaymentResult/PaymentFailed"; // *** IMPORT COMPONENT FAILED ***
import PageNotFound from "../pages/PageNotFound";
import Login from "../pages/HomeTemplate/Login";
import Register from "../pages/HomeTemplate/Register";
import Profile from "../pages/HomeTemplate/Profile";

const routes = [
  {
    path: "",
    element: HomeTemplate, // Các route con sẽ dùng layout HomeTemplate
    children: [
      {
        path: "", // Trang chủ
        element: HomePage,
      },
      {
        path: "room-list", // Ví dụ route cũ
        element: RoomList,
      },
      {
        path: "roomLocation/:tinhThanh", // Route địa điểm
        element: RoomLocation,
      },
      {
        path: "detailroom/:id", // Route chi tiết phòng
        element: DetailRoom,
      },
      {
        path: "location", // Ví dụ route cũ
        element: LocationList,
      },
      {
        path: "paying", // *** ROUTE MỚI CHO TRANG THANH TOÁN ***
        element: Paying,
      },
      // Các route khác trong HomeTemplate (nếu có)
    ],
  },
  // --- CÁC ROUTE NẰM NGOÀI HomeTemplate CHO TRANG KẾT QUẢ ---
  {
    path: "/payment-success", // *** ROUTE MỚI CHO TRANG THÀNH CÔNG ***
    element: PaymentSuccess,
    // element: HomeTemplate, // Nếu muốn trang kết quả vẫn có Header/Footer
    // children: [ { index: true, element: PaymentSuccess } ] // Cách khác nếu dùng layout
  },
  {
    path: "/payment-failed", // *** ROUTE MỚI CHO TRANG THẤT BẠI ***
    element: PaymentFailed,
    // element: HomeTemplate, // Nếu muốn trang kết quả vẫn có Header/Footer
    // children: [ { index: true, element: PaymentFailed } ] // Cách khác nếu dùng layout
  },
  // --- Route 404 (Tùy chọn) ---
  {
    path: "*",
    element: PageNotFound, // Component trang 404 của bạn
  },
  {
    path: "login",
    element: Login,
  },
  {
    path: "register",
    element: Register,
  },
  {
    path: "profile",
    element: Profile,
  }

];

// Hàm renderRoutes giữ nguyên
export const renderRoutes = () => {
  return routes.map((route) => {
    if (route.children) {
      return (
        <Route
          key={route.path || "layout"}
          path={route.path}
          element={<route.element />}
        >
          {route.children.map((item) =>
            // Sử dụng index route cho đường dẫn rỗng "" bên trong layout
            item.path === "" ? (
              <Route key="index" index element={<item.element />} />
            ) : (
              <Route
                key={item.path}
                path={item.path}
                element={<item.element />}
              />
            )
          )}
        </Route>
      );
    } else {
      // Xử lý route không có children (như payment-success, payment-failed)
      return (
        <Route key={route.path} path={route.path} element={<route.element />} />
      );
    }
  });
};
