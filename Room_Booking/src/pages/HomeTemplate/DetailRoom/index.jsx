// src/pages/HomeTemplate/DetailRoom/index.jsx (Đã sửa dùng "id")

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
// *** THAY ĐỔI QUAN TRỌNG: LẤY "id" TỪ useParams ***
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaHome,
  FaStar,
  FaWifi,
  FaTv,
  FaParking,
  FaSwimmingPool,
  FaSnowflake,
  FaSprayCan,
  FaCheckCircle,
  FaBed,
  FaBath,
  FaUsers,
  FaUtensils,
  FaTshirt,
  FaExclamationTriangle,
  FaSpinner,
  FaMedal,
  FaTimes,
  FaRegStar,
  FaMinusCircle,
  FaPlusCircle,
} from "react-icons/fa";
import { FaStar as FaStarSolid } from "react-icons/fa";
import { MdOutlineIron } from "react-icons/md";
import { BsGrid3X3 } from "react-icons/bs";
import { format, differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import {
  fetchDetailRoom,
  fetchRoomComments,
  postRoomComment,
  clearDetailRoomState,
  clearPostCommentError,
} from "./slice";

import {
  selectUserData,
  selectLoginLoading,
  selectUserEmail,
} from "./../Login/slice";

const EXCHANGE_RATE_USD_TO_VND = 25400;
const CLEANING_FEE_USD = 8;

// --- Component Star Rating Input ---
const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);
  // ... (Giữ nguyên JSX của StarRatingInput)
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="cursor-pointer text-yellow-500"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          style={{
            filter:
              star > (hoverRating || rating)
                ? "grayscale(100%) opacity(0.3)"
                : "none",
          }}
        >
          <FaStarSolid className="text-xl" />
        </span>
      ))}
      {rating > 0 && (
        <span className="text-sm text-gray-600 ml-2">({rating} sao)</span>
      )}
    </div>
  );
};

// --- Component Image Modal ---
const ImageModal = ({ images = [], onClose }) => {
  // ... (Giữ nguyên code ImageModal)
  if (!images || images.length === 0) return null;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex flex-col items-center justify-start p-4 pt-10 md:p-10 overflow-y-auto"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 md:top-5 md:right-5 text-white text-3xl z-[110] hover:text-gray-300"
        aria-label="Đóng"
      >
        <FaTimes />
      </button>
      <div
        className="w-full max-w-4xl bg-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-5 text-center text-white">
          Hình ảnh phòng
        </h2>
        <div className="space-y-4">
          {images.map((url, index) => (
            <img
              key={index}
              src={
                url ||
                "https://via.placeholder.com/800x500/cccccc/969696?text=Image+Not+Found"
              }
              alt={`Ảnh chi tiết ${index + 1}`}
              className="w-full h-auto object-contain rounded bg-gray-800 block"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x500/cccccc/969696?text=Image+Load+Error";
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Detail Room Component ---
const DetailRoom = () => {
  // *** THAY ĐỔI QUAN TRỌNG: LẤY "id" TỪ useParams ***
  const { id } = useParams(); // Lấy đúng tên tham số từ Route "detailroom/:id"
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: room,
    loading,
    error,
    comments,
    commentsLoading,
    commentsError,
    postCommentLoading,
    postCommentError,
  } = useSelector((state) => state.detailRoomReducer);

  // *** SỬA LẠI CÁCH LẤY STATE AUTH ***
  // *** DÙNG SELECTORS TỪ Login/slice.js (đã truy cập state.loginReducer) ***
  const authUser = useSelector(selectUserData); // Lấy user data
  const authLoading = useSelector(selectLoginLoading); // Lấy loading auth
  const userEmail = useSelector(selectUserEmail); // Lấy email làm ID

  // State Local
  const [newComment, setNewComment] = useState("");
  const [commentRating, setCommentRating] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Xử lý ngày tháng
  const parseDateSafe = (dateInput) => {
    /* ... giữ nguyên ... */
    if (!dateInput) return null;
    try {
      const date =
        typeof dateInput === "string"
          ? parseISO(dateInput)
          : new Date(dateInput);
      return isValid(date) ? date : null;
    } catch (e) {
      return null;
    }
  };
  const initialStartDate = parseDateSafe(location.state?.checkIn);
  const initialEndDate = parseDateSafe(location.state?.checkOut);
  const [dateRange, setDateRange] = useState([
    { startDate: initialStartDate, endDate: initialEndDate, key: "selection" },
  ]);

  // --- Effects ---
  useEffect(() => {
    // *** THAY ĐỔI: SỬ DỤNG BIẾN "id" ***
    const roomId = Number(id); // Chuyển "id" từ URL (string) thành số
    if (roomId && !isNaN(roomId)) {
      if (typeof fetchDetailRoom === "function")
        dispatch(fetchDetailRoom(roomId));
      if (typeof fetchRoomComments === "function")
        dispatch(fetchRoomComments(roomId));
    } else {
      // Lỗi này sẽ hiển thị nếu "id" không phải là số hoặc không có trong URL
      console.error(`[DetailRoom] ID phòng không hợp lệ từ URL: ${id}`);
      // Có thể navigate đi nếu id không hợp lệ
      // navigate('/not-found', { replace: true });
    }
    return () => {
      if (typeof clearDetailRoomState === "function")
        dispatch(clearDetailRoomState());
    };
    // *** THAY ĐỔI: dependency là "id" ***
  }, [dispatch, id]);

  // Đóng DatePicker khi click ngoài
  useEffect(() => {
    /* ... giữ nguyên ... */
    function handleClickOutside(event) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        const dateInputs = document.querySelectorAll(".date-input-trigger");
        let clickedOnInput = false;
        dateInputs.forEach((input) => {
          if (input.contains(event.target)) clickedOnInput = true;
        });
        if (!clickedOnInput) setShowDatePicker(false);
      }
    }
    if (showDatePicker)
      document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  // Xử lý lỗi post comment
  useEffect(() => {
    /* ... giữ nguyên ... */
    if (postCommentError) {
      alert(
        `Lỗi gửi bình luận: ${
          postCommentError?.message || "Lỗi không xác định"
        }`
      );
      if (typeof clearPostCommentError === "function")
        dispatch(clearPostCommentError());
    }
  }, [postCommentError, dispatch]);

  // --- Tính toán ---
  const { averageRating, reviewCount } = useMemo(() => {
    /* ... giữ nguyên ... */
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const validRatings = comments
      .map((c) => c.saoBinhLuan)
      .filter((r) => typeof r === "number" && r >= 0 && r <= 5);
    if (validRatings.length === 0)
      return { averageRating: 0, reviewCount: comments.length };
    const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
    const avg = totalRating / validRatings.length;
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      reviewCount: comments.length,
    };
  }, [comments]);
  const calculateNights = useCallback(() => {
    /* ... giữ nguyên ... */
    const { startDate, endDate } = dateRange[0];
    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
      const nights = differenceInCalendarDays(endDate, startDate);
      return nights > 0 ? nights : 0;
    }
    return 0;
  }, [dateRange]);
  const numberOfNights = calculateNights();
  const roomPricePerNightUSD = Number(room?.giaTien) || 0;
  const roomTotalUSDDisplay =
    numberOfNights > 0 ? roomPricePerNightUSD * numberOfNights : 0;
  const cleaningFeeUSDDisplay = numberOfNights > 0 ? CLEANING_FEE_USD : 0;
  const finalTotalUSDDisplay = roomTotalUSDDisplay + cleaningFeeUSDDisplay;
  const calculateTotalPriceVND = useCallback(() => {
    /* ... giữ nguyên ... */
    if (numberOfNights > 0 && roomPricePerNightUSD > 0) {
      const totalUSD = roomPricePerNightUSD * numberOfNights + CLEANING_FEE_USD;
      const totalVND = Math.round(totalUSD * EXCHANGE_RATE_USD_TO_VND);
      return totalVND < 1000 ? 1000 : totalVND;
    }
    return 0;
  }, [numberOfNights, roomPricePerNightUSD]);
  const finalTotalPriceVND = calculateTotalPriceVND();

  // --- Handlers ---
  const openImageModal = () => setShowImageModal(true);
  const closeImageModal = () => setShowImageModal(false);
  const handleSelectDate = (ranges) => setDateRange([ranges.selection]);
  const incrementGuest = () =>
    room && guestCount < room.khach && setGuestCount((g) => g + 1);
  const decrementGuest = () => guestCount > 1 && setGuestCount((g) => g - 1);

  // Xử lý Đặt phòng
  const handleBooking = () => {
    /* ... giữ nguyên logic ... */
    if (!authUser) {
      alert("Vui lòng đăng nhập để đặt phòng.");
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate || !room || numberOfNights <= 0) {
      alert("Vui lòng chọn ngày nhận và trả phòng hợp lệ.");
      return;
    }
    if (finalTotalPriceVND < 1000) {
      alert("Giá trị đơn hàng không hợp lệ.");
      return;
    }
    const bookingDetails = {
      roomId: room.id,
      userId: authUser.id,
      checkIn: format(startDate, "yyyy-MM-dd"),
      checkOut: format(endDate, "yyyy-MM-dd"),
      guests: guestCount,
      totalAmountVND: finalTotalPriceVND,
      roomName: room.tenPhong,
      pricePerNightUSD: roomPricePerNightUSD,
      numberOfNights: numberOfNights,
      cleaningFeeUSD: cleaningFeeUSDDisplay,
      totalPriceUSD: finalTotalUSDDisplay,
    };
    console.log("[Booking] Navigating to /paying with state:", bookingDetails);
    navigate("/paying", { state: bookingDetails });
  };

  // Xử lý Gửi bình luận
  const handleAddComment = useCallback(() => {
    if (!authUser) return;
    if (!newComment.trim() || commentRating <= 0) {
      alert("Vui lòng nhập nội dung và chọn sao.");
      return;
    }
    // *** THAY ĐỔI: SỬ DỤNG "id" ĐỂ LẤY maPhong ***
    const commentData = {
      maPhong: Number(id), // Lấy từ biến "id" đã useParams
      maNguoiBinhLuan: authUser.id,
      ngayBinhLuan: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      noiDung: newComment.trim(),
      saoBinhLuan: commentRating,
    };
    if (typeof postRoomComment === "function") {
      dispatch(postRoomComment(commentData))
        .unwrap()
        .then(() => {
          setNewComment("");
          setCommentRating(0);
          console.log("Bình luận đã được gửi.");
        })
        .catch((err) => {
          console.error("Lỗi gửi bình luận:", err);
        });
    } else {
      console.error("Action postRoomComment không tồn tại!");
    }
    // *** THAY ĐỔI: dependency là "id" ***
  }, [authUser, dispatch, newComment, commentRating, id]); // Thêm id vào dependencies

  // --- Render Loading / Error / No Data ---
  if (loading || authLoading) {
    /* ... giữ nguyên ... */
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <FaSpinner className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }
  if (error) {
    /* ... giữ nguyên ... */
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] text-center p-6">
        <FaExclamationTriangle className="text-5xl text-red-600 mb-4" />
        <p className="text-xl text-red-700 font-semibold mb-2">
          Lỗi tải dữ liệu phòng
        </p>
        <p className="text-gray-600">
          {error?.message || "Không thể tải thông tin chi tiết."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }
  if (!room) {
    /* ... giữ nguyên ... */
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] text-center p-6">
        <FaExclamationTriangle className="text-5xl text-gray-400 mb-4" />
        <p className="text-xl text-gray-500">Không tìm thấy thông tin phòng</p>
        <p className="text-sm text-gray-400 mt-1">
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  // --- Destructure dữ liệu phòng ---
  const {
    /* ... giữ nguyên ... */ tenPhong = "Chưa có tên",
    khach = 1,
    phongNgu = 0,
    giuong = 0,
    phongTam = 0,
    moTa = "Chưa có mô tả.",
    mayGiat = false,
    banLa = false,
    tivi = false,
    dieuHoa = false,
    wifi = false,
    bep = false,
    doXe = false,
    hoBoi = false,
    banUi = false,
    hinhAnh = "",
  } = room;

  // Dữ liệu giả lập/derived
  const hostName = room.host?.name || "Chủ Nhà";
  const hostAvatar =
    room.host?.avatar ||
    `https://ui-avatars.com/api/?name=${hostName.charAt(
      0
    )}&background=random&color=fff&size=48`;
  const isSuperhost = reviewCount > 10 && averageRating >= 4.8;
  const locationName = room.location?.city || "Địa điểm, Việt Nam";
  const mainImageUrl =
    hinhAnh ||
    "https://via.placeholder.com/1200x800/cccccc/969696?text=No+Image";
  const imageGridUrls =
    room.images && room.images.length > 0
      ? room.images
      : [
          mainImageUrl /* ... ảnh sample ... */,
          "https://via.placeholder.com/600x400/e0e0e0/aaaaaa?text=Sample+2",
          "https://via.placeholder.com/600x400/d0d0d0/999999?text=Sample+3",
          "https://via.placeholder.com/600x400/c0c0c0/888888?text=Sample+4",
          "https://via.placeholder.com/600x400/b0b0b0/777777?text=Sample+5",
        ];
  const amenitiesList = [
    /* ... giữ nguyên ... */
    { name: "Wifi", icon: <FaWifi />, available: wifi },
    { name: "TV", icon: <FaTv />, available: tivi },
    { name: "Điều hòa", icon: <FaSnowflake />, available: dieuHoa },
    { name: "Máy giặt", icon: <FaTshirt />, available: mayGiat },
    { name: "Bàn là/ủi", icon: <MdOutlineIron />, available: banLa || banUi },
    { name: "Bếp", icon: <FaUtensils />, available: bep },
    { name: "Đỗ xe", icon: <FaParking />, available: doXe },
    { name: "Hồ bơi", icon: <FaSwimmingPool />, available: hoBoi },
  ].filter((a) => a.available);

  // --- Render JSX ---
  // Toàn bộ phần JSX bên dưới giữ nguyên như code trước, chỉ đảm bảo
  // các biến như room, authUser, comments, id,... được sử dụng đúng.
  return (
    <>
      <div className="font-sans max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4">
          {/* ... JSX Header ... */}
          <h1 className="text-2xl md:text-3xl font-semibold mb-1">
            {tenPhong}
          </h1>
          <div className="flex items-center text-sm text-gray-600 flex-wrap gap-x-3 gap-y-1">
            {reviewCount > 0 && (
              <span className="flex items-center font-medium">
                <FaStarSolid className="text-black mr-1" /> {averageRating}{" "}
                <span
                  className="text-gray-500 font-normal ml-1 underline cursor-pointer hover:text-black"
                  onClick={() =>
                    document
                      .getElementById("comments-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  ({reviewCount} đánh giá)
                </span>
              </span>
            )}
            {isSuperhost && (
              <>
                <span>•</span>
                <span className="flex items-center">
                  <FaMedal className="text-red-500 mr-1" /> Chủ nhà siêu cấp
                </span>
              </>
            )}
            <span>•</span>
            <span className="hover:underline cursor-pointer font-medium text-gray-700">
              {locationName}
            </span>
          </div>
        </div>

        {/* Image Grid */}
        <div
          className="mb-8 rounded-xl overflow-hidden relative max-h-[60vh] bg-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 cursor-pointer"
          onClick={openImageModal}
        >
          {/* ... JSX Image Grid ... */}
          <div className="sm:col-span-2 lg:col-span-2 h-full min-h-[300px] sm:min-h-[400px] lg:min-h-full group">
            {" "}
            <img
              src={imageGridUrls[0]}
              alt={`${tenPhong} - Ảnh chính`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = mainImageUrl;
              }}
            />
          </div>
      
          <button
            onClick={openImageModal}
            className="absolute bottom-4 right-4 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-400 hover:bg-gray-100 transition z-10 shadow-md"
          >
            <BsGrid3X3 className="inline mr-1.5 text-base" /> Hiển thị tất cả
            ảnh
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left Column */}
          <div className="lg:w-3/5 order-2 lg:order-1">
            {/* Host Info */}
            <div className="flex justify-between items-start pb-6 border-b">
              {/* ... JSX Host Info ... */}
              <div>
                {" "}
                <h2 className="text-xl font-semibold mb-1">
                  Toàn bộ chỗ ở. Chủ nhà: {hostName}
                </h2>{" "}
                <div className="text-sm text-gray-600 flex items-center flex-wrap gap-x-2">
                  {" "}
                  <span>{khach} khách</span>{" "}
                  {phongNgu > 0 && (
                    <>
                      <span>•</span>
                      <span>{phongNgu} phòng ngủ</span>
                    </>
                  )}{" "}
                  {giuong > 0 && (
                    <>
                      <span>•</span>
                      <span>{giuong} giường</span>
                    </>
                  )}{" "}
                  {phongTam > 0 && (
                    <>
                      <span>•</span>
                      <span>{phongTam} phòng tắm</span>
                    </>
                  )}{" "}
                </div>
              </div>
              <img
                src={hostAvatar}
                alt={`Avatar ${hostName}`}
                className="w-12 h-12 rounded-full object-cover bg-gray-300 flex-shrink-0 ml-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/48/eeeeee/cccccc?text=?";
                }}
              />
            </div>
            {/* Highlights */}
            <div className="py-6 border-b space-y-4 text-sm">
              {/* ... JSX Highlights ... */}
              <div className="flex items-start">
                <FaHome className="mr-4 text-xl mt-0.5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Toàn bộ nhà</p>
                  <p className="text-gray-600">
                    Bạn sẽ có riêng không gian này cho mình.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaSprayCan className="mr-4 text-xl mt-0.5 text-gray-700 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Vệ sinh tăng cường</p>
                  <p className="text-gray-600">
                    Chủ nhà cam kết tuân thủ quy trình vệ sinh 5 bước.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaCheckCircle className="mr-4 text-xl mt-0.5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Miễn phí hủy trong 48 giờ</p>
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-semibold mb-3">Giới thiệu</h2>
              <p className="text-gray-700 text-sm whitespace-pre-line">
                {moTa}
              </p>
            </div>
            {/* Amenities */}
            <div className="py-6 border-b">
              {/* ... JSX Amenities ... */}
              <h2 className="text-xl font-semibold mb-4">Tiện nghi</h2>
              {amenitiesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {amenitiesList.slice(0, 10).map((a) => (
                    <div key={a.name} className="flex items-center text-sm">
                      {React.cloneElement(a.icon, {
                        className: "mr-3 text-xl text-gray-700",
                      })}
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic">Chưa có thông tin.</p>
              )}
              {amenitiesList.length > 10 && (
                <button className="mt-4 text-sm font-semibold border border-black rounded-lg px-4 py-2 hover:bg-gray-100">
                  Hiện tất cả {amenitiesList.length} tiện nghi
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="py-6" id="comments-section">
              {/* ... JSX Comments Section ... */}
              {reviewCount > 0 ? (
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaStarSolid className="mr-2" />
                  {averageRating} • {reviewCount} đánh giá
                </h2>
              ) : (
                <h2 className="text-xl font-semibold mb-4">Chưa có đánh giá</h2>
              )}
              {commentsLoading ? (
                <div className="py-6 text-center">
                  <FaSpinner className="animate-spin inline mr-2" />
                  Đang tải...
                </div>
              ) : commentsError ? (
                <div className="text-red-600 p-3 bg-red-100 rounded">
                  {commentsError.message || "Lỗi tải bình luận"}
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                  {comments.slice(0, 6).map((c) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <img
                          src={
                            c.avatar ||
                            `https://ui-avatars.com/api/?name=${
                              c.tenNguoiBinhLuan?.[0] || "?"
                            }&size=40&background=random`
                          }
                          alt={c.tenNguoiBinhLuan}
                          className="w-9 h-9 rounded-full bg-gray-300"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {c.tenNguoiBinhLuan}
                          </p>
                          <p className="text-xs text-gray-500">
                            {c.ngayBinhLuan && isValid(new Date(c.ngayBinhLuan))
                              ? format(new Date(c.ngayBinhLuan), "dd/MM/yyyy")
                              : ""}
                          </p>
                        </div>
                      </div>
                      {c.saoBinhLuan > 0 && (
                        <div className="flex items-center space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStarSolid
                              key={i}
                              className={
                                i < c.saoBinhLuan
                                  ? "text-yellow-500 text-xs"
                                  : "text-gray-300 text-xs"
                              }
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {c.noiDung}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-500">Chưa có bình luận nào.</p>
              )}
              {comments && comments.length > 6 && (
                <button className="text-sm font-semibold border border-black rounded-lg px-4 py-2 hover:bg-gray-100">
                  Hiện tất cả {comments.length} bình luận
                </button>
              )}
              {/* Add Comment Form */}
              {authUser ? (
                <div className="mt-8 pt-6 border-t">
                  {" "}
                  <h3 className="text-lg font-semibold mb-3">
                    Để lại đánh giá
                  </h3>{" "}
                  <div className="mb-3">
                    <StarRatingInput
                      rating={commentRating}
                      setRating={setCommentRating}
                    />
                  </div>{" "}
                  <textarea
                    className="w-full p-3 border rounded focus:ring-red-500 focus:border-red-500"
                    rows="4"
                    placeholder="Cảm nhận của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>{" "}
                  {postCommentError && (
                    <p className="text-red-500 text-sm mt-1">
                      {postCommentError?.message}
                    </p>
                  )}{" "}
                  <button
                    onClick={handleAddComment}
                    disabled={
                      postCommentLoading ||
                      !newComment.trim() ||
                      commentRating === 0
                    }
                    className="mt-3 bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                  >
                    {" "}
                    {postCommentLoading ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      "Gửi"
                    )}{" "}
                  </button>{" "}
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t text-center text-sm">
                  {" "}
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="text-red-500 font-semibold hover:underline"
                  >
                    Đăng nhập
                  </Link>{" "}
                  để bình luận.{" "}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Booking Sidebar) */}
          <div className="lg:w-2/5 order-1 lg:order-2 lg:sticky lg:top-24 self-start">
            <div className="p-5 sm:p-6 border rounded-xl shadow-lg bg-white">
              {/* ... JSX Booking Sidebar ... */}
              <div className="flex flex-wrap items-baseline justify-between mb-5 pb-4 border-b gap-x-4 gap-y-1">
                {" "}
                <div>
                  <span className="text-2xl font-bold">
                    ${roomPricePerNightUSD.toLocaleString("en-US")}
                  </span>
                  <span className="text-gray-500 text-sm"> / đêm</span>
                </div>{" "}
                {reviewCount > 0 && (
                  <div
                    className="text-sm flex items-center font-semibold cursor-pointer hover:underline"
                    onClick={() =>
                      document
                        .getElementById("comments-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    <FaStarSolid className="mr-1" />
                    {averageRating}
                    <span className="ml-1">({reviewCount} đánh giá)</span>
                  </div>
                )}{" "}
              </div>
              <div className="relative border border-gray-300 rounded-lg mb-4">
                {" "}
                <div className="grid grid-cols-2">
                  {" "}
                  <div
                    className="p-3 hover:bg-gray-50 cursor-pointer date-input-trigger"
                    onClick={() => setShowDatePicker((d) => !d)}
                  >
                    <label className="block text-xs font-bold uppercase mb-1">
                      Nhận phòng
                    </label>
                    <div className="text-sm">
                      {dateRange[0].startDate
                        ? format(dateRange[0].startDate, "dd/MM/yyyy")
                        : "Thêm ngày"}
                    </div>
                  </div>{" "}
                  <div
                    className="p-3 hover:bg-gray-50 cursor-pointer border-l date-input-trigger"
                    onClick={() => setShowDatePicker((d) => !d)}
                  >
                    <label className="block text-xs font-bold uppercase mb-1">
                      Trả phòng
                    </label>
                    <div className="text-sm">
                      {dateRange[0].endDate
                        ? format(dateRange[0].endDate, "dd/MM/yyyy")
                        : "Thêm ngày"}
                    </div>
                  </div>{" "}
                </div>{" "}
                <div className="border-t p-3 flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase">
                    Khách
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={decrementGuest}
                      disabled={guestCount <= 1}
                      className="text-gray-500 hover:text-red-500 focus:outline-none disabled:text-gray-300"
                    >
                      <FaMinusCircle size={20} />
                    </button>
                    <span className="font-medium">{guestCount}</span>
                    <button
                      onClick={incrementGuest}
                      disabled={!room || guestCount >= room.khach}
                      className="text-gray-500 hover:text-red-500 focus:outline-none disabled:text-gray-300"
                    >
                      <FaPlusCircle size={20} />
                    </button>
                  </div>
                </div>{" "}
                {showDatePicker && (
                  <div
                    ref={datePickerRef}
                    className="absolute top-full left-0 right-0 mt-1 z-30 bg-white shadow-xl border rounded-md overflow-hidden"
                  >
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleSelectDate}
                      minDate={new Date()}
                      months={1}
                      direction="vertical"
                      showDateDisplay={false}
                      staticRanges={[]}
                      inputRanges={[]}
                      rangeColors={["#ef4444"]}
                      className="w-full"
                    />
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-black p-1"
                      aria-label="Đóng lịch"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}{" "}
              </div>
              <button
                onClick={handleBooking}
                disabled={numberOfNights <= 0}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg hover:opacity-90 font-semibold text-base shadow-md disabled:opacity-50"
              >
                Đặt phòng
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                Chưa trừ tiền
              </p>
              {numberOfNights > 0 ? (
                <div className="mt-6 border-t pt-5 text-sm space-y-3">
                  {" "}
                  <div className="flex justify-between">
                    <span>
                      ${roomPricePerNightUSD.toLocaleString()} x{" "}
                      {numberOfNights} đêm
                    </span>
                    <span>${roomTotalUSDDisplay.toLocaleString()}</span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span>Phí vệ sinh</span>
                    <span>${cleaningFeeUSDDisplay.toLocaleString()}</span>
                  </div>{" "}
                  <div className="flex justify-between font-semibold border-t pt-3 mt-2 text-base">
                    <span>Tổng (USD)</span>
                    <span>${finalTotalUSDDisplay.toLocaleString()}</span>
                  </div>{" "}
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Tổng thanh toán (VND)</span>
                    <span className="font-medium">
                      {finalTotalPriceVND.toLocaleString("vi-VN")} đ
                    </span>
                  </div>{" "}
                </div>
              ) : (
                <div className="mt-6 border-t pt-5 text-sm">
                  <p className="text-center italic text-gray-500">
                    Chọn ngày xem giá.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal images={imageGridUrls} onClose={closeImageModal} />
      )}
    </>
  );
};

export default DetailRoom;
