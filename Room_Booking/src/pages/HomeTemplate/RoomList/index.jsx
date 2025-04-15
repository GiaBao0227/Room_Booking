// src/pages/HomeTemplate/RoomList/index.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRooms } from "./slice";
import RoomCard from "./RoomCard";
import { useParams } from "react-router-dom"; // Import useParams

export default function RoomList() {
  const dispatch = useDispatch();
  const { locationId } = useParams(); // Lấy locationId từ URL
  const {
    data: rooms,
    loading,
    error,
  } = useSelector((state) => state.roomListReducer);

  useEffect(() => {
    dispatch(fetchRooms(locationId)); // Truyền locationId cho fetchRooms
  }, [dispatch, locationId]);

  if (loading) return <p className="p-4">Đang tải danh sách phòng...</p>;
  if (error) return <p className="p-4 text-red-500">Lỗi: {error}</p>;
  if (!rooms || rooms.length === 0)
    return <p className="p-4">Không có phòng nào.</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">
        Danh sách phòng tại {locationId}
      </h2>
      {/* Responsive grid: 1 cột ở mobile, 2 ở sm, 3 ở md, 4 ở lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rooms.map((room) => {
          // Nếu có danhSachAnh thì dùng, nếu không fallback room.hinhAnh
          const images =
            room.danhSachAnh && room.danhSachAnh.length > 0
              ? room.danhSachAnh
              : [room.hinhAnh];

          return (
            <RoomCard
              key={room.id}
              room={{
                id: room.id,
                danhSachAnh: images,
                tenPhong: room.tenPhong,
                moTa: room.moTa,
                giaTien: room.giaTien,
                danhGia: room.danhGia,
                // Các trường khác nếu cần...
                label: room.label || "Được khách yêu thích",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
