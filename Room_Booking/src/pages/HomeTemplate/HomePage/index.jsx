// --- START OF FILE HomePage/index.jsx ---

import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// *** KIỂM TRA LẠI ĐƯỜNG DẪN NÀY CHO ĐÚNG VỚI CẤU TRÚC DỰ ÁN CỦA BẠN ***
import { setSelectedLocation } from "./../LocationList/slice";
// *** Chỉ cần import hàm slugify KHÔNG CÓ DẤU GẠCH NGANG ***
// Hàm này sẽ giữ lại dấu tiếng Việt, đúng như slug mà RoomLocation đang xử lý được
import { slugifyWithoutDash } from "./../../../utils/slugify";
import AOS from "aos";
import "aos/dist/aos.css";

// Import các hình ảnh
import HomeImage from "../../../assets/Home.png";
import BeachImage from "../../../assets/Beach.png";
import HillImage from "../../../assets/Hill.png";
import DogImage from "../../../assets/Dog.png";

function HomePage() {
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchNearbyLocations = async () => {
      try {
        const response = await api.get(
          "/vi-tri/phan-trang-tim-kiem?pageIndex=1&pageSize=8"
        );
        if (response.data?.content?.data) {
          setNearbyLocations(response.data.content.data.slice(0, 8));
        } else {
          console.warn(
            "API response structure might have changed:",
            response.data
          );
          setNearbyLocations([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu địa điểm gần đây:", error);
        setNearbyLocations([]);
      }
    };
    fetchNearbyLocations();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Dữ liệu travelTimes
  const travelTimes = {
    1: "15 phút lái xe",
    2: "3 giờ lái xe",
    3: "6.5 giờ lái xe",
    4: "15 phút lái xe",
    5: "7.5 giờ lái xe",
    6: "45 phút lái xe",
    7: "30 phút lái xe",
    8: "5 giờ lái xe",
    // Đảm bảo các ID này khớp với ID từ API
  };

  const stayAnywhereItems = [
    // Cập nhật đường dẫn 'link' nếu cần thiết
    {
      id: 1,
      image: HomeImage,
      title: "Toàn bộ nhà",
      link: `/rooms/filter?type=house`,
    },
    {
      id: 2,
      image: BeachImage,
      title: "Chỗ ở độc đáo",
      link: `/rooms/filter?type=unique`,
    },
    {
      id: 3,
      image: HillImage,
      title: "Trang trại và thiên nhiên",
      link: `/rooms/filter?type=nature`,
    },
    {
      id: 4,
      image: DogImage,
      title: "Cho phép mang thú cưng",
      link: `/rooms/filter?pets=true`,
    },
  ];

  // --- HÀM XỬ LÝ KHI CLICK VÀO ĐỊA ĐIỂM GẦN ĐÂY ---
  // Hàm này sẽ dispatch action VÀ thực hiện điều hướng với slug giữ nguyên dấu
  const handleSelectAndNavigate = (location) => {
    if (!location || typeof location.id === "undefined") {
      console.error("Dữ liệu địa điểm không hợp lệ:", location);
      return;
    }

    const locationName = location.tinhThanh || location.tenViTri;
    const locationId = location.id; // Giữ lại ID để log nếu cần

    if (!locationName) {
      console.error("Tên vị trí (tinhThanh/tenViTri) bị thiếu:", location);
      return;
    }

    // BƯỚC 1: Dispatch action để cập nhật state
    console.log(
      `HomePage: Dispatching setSelectedLocation for location ID: ${locationId}`
    );
    dispatch(setSelectedLocation(location));

    // *** BƯỚC 2: Tạo slug bằng hàm slugifyWithoutDash ***
    // Hàm này sẽ tạo ra slug đúng như RoomLocation đang xử lý được (vd: "hồchíminh", "đànẵng")
    const targetSlug = slugifyWithoutDash(locationName);
    console.log(
      `Generating slug for ID ${locationId} ("${locationName}") using slugifyWithoutDash: "${targetSlug}"`
    );

    // Kiểm tra lại slug (không nên rỗng)
    if (!targetSlug) {
      console.error(`Could not generate target slug for location:`, location);
      return;
    }

    // BƯỚC 3: Thực hiện điều hướng với slug vừa tạo
    console.log(`HomePage: Navigating to /roomLocation/${targetSlug}`);
    navigate(`/roomLocation/${targetSlug}`);
  };
  // --- KẾT THÚC HÀM XỬ LÝ ---

  return (
    <div className="bg-white">
      {/* Phần Khám phá những điểm đến gần đây */}
      <section className="nearby-locations py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">
            Khám phá những điểm đến gần đây
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.isArray(nearbyLocations) && nearbyLocations.length > 0 ? (
              nearbyLocations.map((location, index) => (
                <div
                  key={location.id !== undefined ? location.id : index}
                  className="location-card flex items-center p-3 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer border border-gray-100 hover:border-gray-200"
                  // Gọi hàm xử lý mới khi click
                  onClick={() => handleSelectAndNavigate(location)}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  {/* Phần hiển thị hình ảnh */}
                  <div className="w-16 h-16 flex-shrink-0 mr-4">
                    <img
                      src={
                        location.hinhAnh ||
                        "https://via.placeholder.com/64?text=N/A"
                      }
                      alt={
                        location.tenViTri || location.tinhThanh || "Địa điểm"
                      }
                      className="object-cover w-full h-full rounded-md bg-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/64?text=Error";
                      }}
                    />
                  </div>
                  {/* Phần hiển thị tên và thời gian */}
                  <div className="flex-grow">
                    <h3 className="text-base font-medium">
                      {location.tinhThanh || location.tenViTri || "Chưa có tên"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {travelTimes[location.id] || ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-4">
                Không có địa điểm nào gần đây để hiển thị.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Phần Ở bất cứ đâu */}
      <section className="stay-anywhere py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Ở bất cứ đâu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stayAnywhereItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => navigate(item.link)} // Vẫn dùng navigate trực tiếp
                data-aos="flip-left"
                data-aos-delay={index * 100}
                className="flex flex-col group cursor-pointer"
              >
                <div className="overflow-hidden rounded-xl shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/200x240?text=Error";
                    }}
                  />
                </div>
                <h3 className="text-lg font-medium mt-3 mb-1">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
// --- END OF FILE HomePage/index.jsx ---
