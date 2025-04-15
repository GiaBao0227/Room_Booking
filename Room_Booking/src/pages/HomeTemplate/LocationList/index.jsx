import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLocations, setSelectedLocation } from "./slice";
import { useNavigate } from "react-router-dom";

function LocationList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    locations = [],
    loading,
    error,
  } = useSelector((state) => state.locationListReducer);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  if (loading) return <div>Đang tải địa điểm...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const uniqueLocations = locations
    .filter(
      (loc, index, self) =>
        self.findIndex((l) => l.tinhThanh === loc.tinhThanh) === index
    )
    .slice(0, 8); // Giới hạn chỉ lấy 8 tỉnh/thành

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/=+$/, "");
  };
  // Hàm xử lý khi người dùng click vào một địa điểm
  const handleSelect = (loc) => {
    const slug = slugify(loc.tinhThanh); // Tạo slug ngay khi chọn
    dispatch(setSelectedLocation(loc));
  };
  //Cập nhật local storage
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-3 w-72">
      <h2 className="text-center font-semibold mb-2">Địa điểm</h2>

      {/* Ô tìm kiếm địa điểm */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Tìm kiếm địa điểm"
          className="border p-2 w-full rounded"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Grid 3 cột hiển thị ảnh + tên tỉnh/thành */}
      <div className="grid grid-cols-3 gap-3">
        {uniqueLocations
          .filter((loc) =>
            loc.tinhThanh.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((loc) => (
            <div
              key={loc.id}
              onClick={() => handleSelect(loc)}
              className={`flex flex-col items-center cursor-pointer p-2 transition`}
            >
              <img
                src={
                  loc.hinhAnh || "https://via.placeholder.com/64?text=No+Image"
                }
                alt={loc.tinhThanh}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <span className="mt-1 text-sm text-center">{loc.tinhThanh}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default LocationList;
