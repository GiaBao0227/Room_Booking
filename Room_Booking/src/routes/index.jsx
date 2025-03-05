import { Route } from "react-router-dom";
import AdminTemplate from "../pages/AdminTemplate";
import QuanLyNguoiDung from "../pages/AdminTemplate/ThongTin/QuanLyNguoiDung";
import QuanLyThongTinViTri from "../pages/AdminTemplate/ThongTin/QuanLyViTri";
import QuanLyThongTinPhong from "../pages/AdminTemplate/ThongTin/QuanLyThongTinPhong";
const routes = [
  {
    path: "admin",
    element: AdminTemplate,
    children: [
      { path: "QuanLyNguoiDung", element: QuanLyNguoiDung },
      {
        path: "QuanLyThongTinViTri",
        element: QuanLyThongTinViTri,
      },
      {
        path: "QuanLyThongTinPhong",
        element: QuanLyThongTinPhong,
      },
    ],
  },
];

export const renderRoutes = () => {
  return routes.map((route) => {
    if (route.children) {
      return (
        <Route key={route.path} path={route.path} element={<route.element />}>
          {route.children.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={<item.element />}
            />
          ))}
        </Route>
      );
    } else {
      return (
        <Route key={route.path} path={route.path} element={<route.element />} />
      );
    }
  });
};
