// src/pages/HomeTemplate/_Component/Header/index.jsx

import React, { useState, useEffect, forwardRef, useMemo } from "react"; // Đã thêm useMemo
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LocationList from "../../../HomeTemplate/LocationList/index";
import {
  selectIsUserLoggedIn,
  selectUserData,
  logout,
} from "../../../HomeTemplate/Login/slice";
import { setSelectedLocation } from "../../../HomeTemplate/LocationList/slice";
import { FiSearch } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { slugifyWithoutDash } from "./../../../../utils/slugify";
import { Button, Avatar, Dropdown, Popover, message, Spin } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

const getMenuItems = (handleLogout) => [
  {
    key: "profile",
    icon: <UserOutlined />,
    label: <Link to="/profile">Thông tin tài khoản</Link>,
  },
  { type: "divider" },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Đăng xuất",
    onClick: handleLogout,
    danger: true,
  },
];

const CustomDateInput = forwardRef(
  ({ value, onClick, placeholder = "Thêm ngày" }, ref) => (
    <button
      className="text-sm text-gray-500 text-left focus:outline-none bg-transparent w-full h-full px-1"
      onClick={onClick}
      ref={ref}
    >
      {value || placeholder}
    </button>
  )
);


function GuestPicker({ guests, handleGuestChange }) {
  return (
    <div style={{ width: 300 }}>
      {" "}
      {/* Giảm width một chút nếu cần */}
      {/* Người lớn */}
      <div className="flex justify-between items-center py-3 border-b">
        <div>
          <p className="font-semibold">Người lớn</p>
          <p className="text-gray-500 text-sm">Từ 13 tuổi</p>
        </div>
        <div className="flex items-center space-x-3">
          {" "}
          <Button
            shape="circle"
            onClick={() => handleGuestChange("adults", -1)}
            disabled={
              guests.adults <=
              (guests.children > 0 || guests.infants > 0 ? 1 : 0)
            }
          >
            -
          </Button>{" "}
          <span className="w-6 text-center tabular-nums">{guests.adults}</span>{" "}
          <Button shape="circle" onClick={() => handleGuestChange("adults", 1)}>
            +
          </Button>{" "}
        </div>
      </div>
      {/* Trẻ em */}
      <div className="flex justify-between items-center py-3 border-b">
        <div>
          <p className="font-semibold">Trẻ em</p>
          <p className="text-gray-500 text-sm">Độ tuổi 2-12</p>
        </div>
        <div className="flex items-center space-x-3">
          {" "}
          <Button
            shape="circle"
            onClick={() => handleGuestChange("children", -1)}
            disabled={guests.children <= 0}
          >
            -
          </Button>{" "}
          <span className="w-6 text-center tabular-nums">
            {guests.children}
          </span>{" "}
          <Button
            shape="circle"
            onClick={() => handleGuestChange("children", 1)}
          >
            +
          </Button>{" "}
        </div>
      </div>
      {/* Em bé */}
      <div className="flex justify-between items-center py-3 border-b">
        <div>
          <p className="font-semibold">Em bé</p>
          <p className="text-gray-500 text-sm">Dưới 2 tuổi</p>
        </div>
        <div className="flex items-center space-x-3">
          {" "}
          <Button
            shape="circle"
            onClick={() => handleGuestChange("infants", -1)}
            disabled={guests.infants <= 0}
          >
            -
          </Button>{" "}
          <span className="w-6 text-center tabular-nums">{guests.infants}</span>{" "}
          <Button
            shape="circle"
            onClick={() => handleGuestChange("infants", 1)}
          >
            +
          </Button>{" "}
        </div>
      </div>
      {/* Thú cưng */}
      <div className="flex justify-between items-center py-3">
        <div>
          <p className="font-semibold">Thú cưng</p>
          <p className="text-gray-500 text-sm underline cursor-pointer hover:text-black transition">
            Mang theo động vật hỗ trợ?
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {" "}
          <Button
            shape="circle"
            onClick={() => handleGuestChange("pets", -1)}
            disabled={guests.pets <= 0}
          >
            -
          </Button>{" "}
          <span className="w-6 text-center tabular-nums">{guests.pets}</span>{" "}
          <Button shape="circle" onClick={() => handleGuestChange("pets", 1)}>
            +
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsUserLoggedIn);
  const userData = useSelector(selectUserData);
  const { locations, loading: locationsLoading } = useSelector(
    (state) => state.locationListReducer
  );
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [activeDropdown, setActiveDropdown] = useState(null); // State quản lý popover nào đang mở
  const selectedLocation = useSelector(
    (state) => state.locationListReducer.selectedLocation
  );

  // Hàm thay đổi số lượng khách
  function handleGuestChange(type, value) {
    setGuests((prev) => {
      const newValue = Math.max(0, (prev[type] || 0) + value);
      if (
        type === "adults" &&
        newValue < 1 &&
        (prev.children > 0 || prev.infants > 0)
      ) {
        return prev;
      }
      if (type === "adults" || newValue >= 0) {
        if (
          (type === "children" || type === "infants") &&
          value > 0 &&
          prev.adults === 0
        ) {
          return { ...prev, adults: 1, [type]: newValue };
        }
        return { ...prev, [type]: newValue };
      }
      return prev;
    });
  }

  // Hàm tạo text hiển thị tổng số khách
  function totalGuests() {
    const { adults, children, infants, pets } = guests;
    let displayParts = [];
    const totalAdultsChildren = (adults || 0) + (children || 0);
    if (totalAdultsChildren > 0) {
      displayParts.push(`${totalAdultsChildren} khách`);
    }
    if (infants > 0) {
      displayParts.push(`${infants} em bé`);
    }
    if (pets > 0) {
      displayParts.push(`${pets} thú cưng`);
    }
    if (displayParts.length === 0) {
      return "Thêm khách";
    } // Hiển thị "Thêm khách" nếu chưa có ai
    return displayParts.join(", ");
  }

  // Hàm xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    if (selectedLocation && selectedLocation.tinhThanh) {
      const tinhThanhSlug = slugifyWithoutDash(selectedLocation.tinhThanh);
     
      
      navigate(`/roomLocation/${tinhThanhSlug}`);
      setActiveDropdown(null); // Đóng các popover
    } else {
      message.warning("Vui lòng chọn một địa điểm để tìm kiếm.");
      setActiveDropdown("location");
    }
  };


  const limitedLocations = useMemo(
    () => locations?.slice(0, 8) || [],
    [locations]
  );


  const handleLogout = () => {
   
    dispatch(logout());
    message.success("Đăng xuất thành công!");
    navigate("/");
  };


  const menuItems = getMenuItems(handleLogout);

  // *** KHÔNG CẦN HÀM handleAvatarClick nữa ***
  // const handleAvatarClick = () => { navigate('/profile'); };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {" "}
      {/* Bỏ min-h, để chiều cao tự nhiên */}
      {/* Thanh trên */}
      <div className="h-20 container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center space-x-1">
            <img
              src="https://i.pinimg.com/originals/56/5c/2a/565c2a824c7c184e326c751a0fb7e73e.png"
              alt="Airbnb logo"
              className="h-8 w-auto"
            />
            <h1 className="text-red-500 text-2xl font-bold hidden md:block">
              {" "}
              airbnb{" "}
            </h1>
          </Link>
        </div>
        {/* User Area */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {isLoggedIn && userData ? (
            // Khi đã đăng nhập: Chỉ cần Dropdown bao Avatar/Button
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              {/* Button này sẽ trigger Dropdown khi click */}
              <button
                className="flex items-center p-1 border rounded-full hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                aria-label="Tài khoản người dùng"
              >
                <Avatar
                  src={userData.avatar}
                  icon={<UserOutlined />}
                  size="default"
                  className="bg-gray-200 text-gray-600"
                />
              </button>
            </Dropdown>
          ) : (
            // Khi chưa đăng nhập: Các nút Login/Register
            <>
              <Link to="/login">
                <Button
                  type="text"
                  className="font-medium hidden md:inline-block hover:bg-gray-100 rounded-full px-3 py-1.5"
                >
                  {" "}
                  Đăng nhập{" "}
                </Button>
                <Button
                  type="text"
                  className="font-medium md:hidden hover:bg-gray-100 rounded-full p-2"
                  icon={<UserOutlined style={{ fontSize: "1.1rem" }} />}
                />
              </Link>
              <Link to="/register">
                <Button
                  type="primary"
                  danger
                  className="hidden md:inline-flex rounded-full px-3 py-1.5"
                >
                  {" "}
                  Đăng ký{" "}
                </Button>
                <Button
                  type="primary"
                  danger
                  className="md:hidden rounded-full px-3 py-1.5 text-xs"
                >
                  {" "}
                  Đ.ký{" "}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Thanh Tìm kiếm - Nằm dưới thanh trên, căn giữa */}
      <div className="pb-4 flex justify-center px-4">
        {" "}
        {/* Container để căn giữa và tạo khoảng cách dưới */}
        <div className="flex flex-col md:flex-row items-stretch bg-white rounded-full shadow-lg border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 w-full max-w-3xl">
          {" "}
          {/* Max-width và shadow */}
          {/* 1. Địa điểm */}
          <div className="flex-1 w-full md:w-auto">
            <Popover
              content={
                <Spin spinning={locationsLoading}>
                  <div
                    style={{
                      width: "300px",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <LocationList
                      locations={limitedLocations}
                      onSelect={() => {
                        dispatch(setSelectedLocation(arguments[0]));
                        setActiveDropdown(null);
                      }}
                    />
                  </div>
                </Spin>
              } // Cập nhật selectedLocation khi chọn
              trigger="click"
              placement="bottomLeft"
              arrow={false}
              open={activeDropdown === "location"}
              onOpenChange={(visible) =>
                setActiveDropdown(visible ? "location" : null)
              }
            >
              <button className="w-full h-full px-6 py-3 text-left rounded-t-full md:rounded-l-full md:rounded-tr-none hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-300">
                <span className="block text-xs font-bold">Địa điểm</span>
                <span className="block text-sm text-gray-500 truncate">
                  {selectedLocation
                    ? selectedLocation.tinhThanh
                    : "Tìm kiếm điểm đến"}
                </span>
              </button>
            </Popover>
          </div>
          {/* 2. Nhận phòng */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <div className="w-full h-full px-4 py-3 text-left hover:bg-gray-100 transition relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-300">
              {" "}
              {/* Thêm focus-within */}
              <span className="block text-xs font-bold">Nhận phòng</span>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => {
                  setCheckInDate(date);
                  if (!checkOutDate) setActiveDropdown("checkout");
                }}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={new Date()}
                placeholderText="Thêm ngày"
                customInput={<CustomDateInput />}
                wrapperClassName="w-full date-picker-wrapper"
                popperPlacement="bottom-start"
                open={activeDropdown === "checkin"}
                onInputClick={() => setActiveDropdown("checkin")}
                onClickOutside={() => {
                  if (activeDropdown === "checkin") setActiveDropdown(null);
                }}
              />
            </div>
          </div>
          {/* 3. Trả phòng */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <div className="w-full h-full px-4 py-3 text-left hover:bg-gray-100 transition relative focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-300">
              <span className="block text-xs font-bold">Trả phòng</span>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => {
                  setCheckOutDate(date);
                  setActiveDropdown("guest");
                }}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate || new Date()}
                placeholderText="Thêm ngày"
                customInput={<CustomDateInput />}
                wrapperClassName="w-full date-picker-wrapper"
                popperPlacement="bottom-start"
                open={activeDropdown === "checkout"}
                onInputClick={() => setActiveDropdown("checkout")}
                onClickOutside={() => {
                  if (activeDropdown === "checkout") setActiveDropdown(null);
                }}
                disabled={!checkInDate}
              />
            </div>
          </div>
          {/* 4. Khách & Nút Tìm kiếm */}
          <div className="flex-1 w-full md:w-auto">
            <Popover
              content={
                <GuestPicker
                  guests={guests}
                  handleGuestChange={handleGuestChange}
                />
              }
              trigger="click"
              placement="bottomRight"
              arrow={false}
              open={activeDropdown === "guest"}
              onOpenChange={(visible) =>
                setActiveDropdown(visible ? "guest" : null)
              }
            >
              {/* Container chứa text khách và nút search */}
              <div className="flex items-center justify-between pl-6 pr-2 py-1.5 rounded-b-full md:rounded-r-full md:rounded-bl-none hover:bg-gray-100 transition cursor-pointer h-full focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-300">
                <div className="text-left flex-grow mr-2">
                  <span className="block text-xs font-bold">Khách</span>
                  <span className="block text-sm text-gray-500 truncate">
                    {totalGuests()}
                  </span>
                </div>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<FiSearch style={{ fontSize: "1rem" }} />}
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearch();
                  }}
                  danger
                  className="shadow-md flex items-center justify-center flex-shrink-0"
                  disabled={!selectedLocation}
                />
              </div>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
