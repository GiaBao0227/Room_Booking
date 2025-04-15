// src/pages/HomeTemplate/RoomList/RoomCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoomCard({ room }) {
  const navigate = useNavigate();

  // Lấy ảnh: dùng phần tử đầu tiên của danhSachAnh hoặc fallback
  const imageUrl =
    room.danhSachAnh && room.danhSachAnh.length > 0
      ? room.danhSachAnh[0]
      : "https://via.placeholder.com/300x200?text=No+Image";

  // Các thông tin phụ (bạn có thể điều chỉnh theo dữ liệu thực tế)
  const location = room.tenPhong || "Bangkok, Thailand";
  const rating = room.danhGia ? `${room.danhGia.toFixed(2)}★` : "4.90★";
  const subText = room.moTa || "Stay with bnb - Fab business";
  const dateRange = room.dateRange || "May 20 - Jun 1";
  const price = room.giaTien
    ? `${room.giaTien.toLocaleString("vi-VN")} / night`
    : "933,704 / night";
  const labelText =
    room.label === "Được khách yêu thích" ? "Guest favorite" : room.label;

  return (
    <div
      onClick={() => navigate(`/detailroom/${room.id}`)} // Chuyển đến trang chi tiết
      className="relative bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer overflow-hidden w-full md:w-64"
    >
      {/* Phần ảnh */}
      <div className="relative w-full h-48 bg-gray-200">
        <img
          src={imageUrl}
          alt={location}
          className="w-full h-full object-cover"
        />

        {/* Label ở góc trên trái */}
        {labelText && (
          <div className="absolute top-2 left-2 bg-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            {labelText}
          </div>
        )}

        {/* Icon trái tim */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            className="h-5 w-5 text-pink-500"
          >
            <path d="M3.172 5.172a4.004 4.004 0 015.656 0L10 6.343l1.172-1.171a4.004 4.004 0 015.656 5.656L10 16.656l-6.828-6.828a4.004 4.004 0 010-5.656z" />
          </svg>
        </button>
      </div>

      {/* Thông tin phòng */}
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold line-clamp-1">{location}</p>
          <p className="text-xs text-gray-500">{rating}</p>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{subText}</p>
        <p className="text-xs text-gray-500">{dateRange}</p>
        <p className="text-sm font-semibold">{price}</p>
      </div>
    </div>
  );
}
