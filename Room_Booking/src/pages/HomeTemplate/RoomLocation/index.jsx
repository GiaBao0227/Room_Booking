// --- START OF FILE RoomLocation/index.jsx ---

import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRoomsLocation } from "./slice";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { slugifyWithoutDash } from "../../../utils/slugify";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const RoomLocation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tinhThanh: slugParamFromUrl } = useParams();

  const {
    list: rooms,
    loading: roomLoading,
    error: roomError,
  } = useSelector((state) => state.roomLocationReducer);

  const {
    locations,
    loading: locationLoading, // Giá trị có thể là boolean hoặc string 'loading', 'succeeded', etc.
    error: locationError,
  } = useSelector((state) => state.locationListReducer);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const defaultCenter = [10.762622, 106.660172];
  const defaultZoom = 12;

  const selectedLocationData = useMemo(() => {
    console.log(
      `[RoomLocation] useMemo running. Slug: "${slugParamFromUrl}", Location Loading Value:`,
      locationLoading
    );
    let result = {
      maViTri: null,
      cityName: slugParamFromUrl,
      center: defaultCenter,
    };

    // Kiểm tra trạng thái loading đã hoàn thành hay chưa
    // Chấp nhận giá trị false, 'succeeded', 'failed', 'idle' là đã xong
    const isLocationLoadFinished =
      locationLoading !== true && locationLoading !== "loading";
    console.log(
      `[RoomLocation] Is location load finished? : ${isLocationLoadFinished}`
    );

    if (isLocationLoadFinished) {
      console.log(`[RoomLocation] Condition met: Location loading finished.`);
      if (
        locations &&
        Array.isArray(locations) &&
        locations.length > 0 &&
        slugParamFromUrl
      ) {
        const slugParamLower = slugParamFromUrl.toLowerCase();
        console.log(
          `[RoomLocation] Starting search for slug: "${slugParamLower}"`
        );

        const foundLocation = locations.find((loc) => {
          if (!loc || !loc.tinhThanh) return false;
          const locationSlug = slugifyWithoutDash(loc.tinhThanh).toLowerCase();
          return locationSlug === slugParamLower;
        });

        if (foundLocation) {
          console.log(`[RoomLocation] ✅ Match FOUND:`, foundLocation);
          const lat = foundLocation.latitude;
          const lng = foundLocation.longitude;
          const centerCoordinates =
            typeof lat === "number" && typeof lng === "number"
              ? [lat, lng]
              : defaultCenter;
          result = {
            maViTri: foundLocation.id,
            cityName: foundLocation.tinhThanh,
            center: centerCoordinates,
          };
        } else {
          console.warn(
            `[RoomLocation] ❌ Match NOT FOUND for slug "${slugParamLower}" in the loaded locations.`
          );
        }
      } else {
        console.warn(
          `[RoomLocation] Cannot search even though loading finished: Locations array empty/invalid or slug missing.`
        );
      }
    } else {
      console.log(
        `[RoomLocation] Search skipped. Location is still loading (current state: ${locationLoading})`
      );
    }
    console.log("[RoomLocation] Final selectedLocationData result:", result);
    return result;
  }, [locations, locationLoading, slugParamFromUrl, defaultCenter]);

  const { maViTri, cityName, center } = selectedLocationData;

  useEffect(() => {
    console.log(
      `[RoomLocation] useEffect Fetch Rooms Check - maViTri: ${maViTri}`
    );
    if (maViTri !== null) {
      console.log(
        `[RoomLocation] Dispatching fetchRoomsLocation with maViTri: ${maViTri}`
      );
      dispatch(fetchRoomsLocation(maViTri));
    }
  }, [dispatch, maViTri]);

  useEffect(() => {
    if (!mapContainer.current) return;
    const isLocationLoadFinished =
      locationLoading !== true && locationLoading !== "loading";
    if (isLocationLoadFinished) {
      // Chỉ init/update map khi có tọa độ cuối cùng
      if (!mapRef.current) {
        console.log("[RoomLocation] Initializing map with center:", center);
        mapRef.current = L.map(mapContainer.current).setView(
          center,
          defaultZoom
        );
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current);
      } else {
        // Chỉ flyTo nếu center thực sự thay đổi để tránh animation không cần thiết
        const currentMapCenter = mapRef.current.getCenter();
        if (
          Math.abs(currentMapCenter.lat - center[0]) > 1e-6 ||
          Math.abs(currentMapCenter.lng - center[1]) > 1e-6
        ) {
          console.log("[RoomLocation] Updating map view to center:", center);
          mapRef.current.flyTo(center, defaultZoom);
        }
      }
    }
    // Render markers dựa trên trạng thái rooms, chỉ cần map đã init
    if (mapRef.current) {
      if (roomLoading === "succeeded" && rooms) {
        clearMarkers(mapRef.current);
        renderMarkers(rooms, mapRef.current);
      } else if (roomLoading !== "loading") {
        // Xóa marker nếu không load hoặc lỗi
        clearMarkers(mapRef.current);
      }
    }
  }, [center, defaultZoom, rooms, roomLoading, locationLoading]); // Phụ thuộc vào cả locationLoading để init map đúng lúc

  useEffect(() => {
    const map = mapRef.current;
    return () => {
      if (map) map.remove();
      mapRef.current = null;
    };
  }, []);

  // *** HÀM HELPER ĐẦY ĐỦ ***
  const clearMarkers = (map) => {
    if (!map) return;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
  };

  const renderMarkers = (roomsToRender, map) => {
    if (!map || !Array.isArray(roomsToRender)) return;
    console.log(`[RoomLocation] Rendering ${roomsToRender.length} markers.`);
    const roomLatProp = "latitude";
    const roomLngProp = "longitude";
    let renderedCount = 0;
    roomsToRender.forEach((room) => {
      const lat = room[roomLatProp];
      const lng = room[roomLngProp];
      if (typeof lat === "number" && typeof lng === "number") {
        try {
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(
            `<h3>${
              room.tenPhong || "Chưa có tên"
            }</h3><p style="max-width: 200px; white-space: normal; overflow-wrap: break-word;">${
              room.moTa || "Không có mô tả."
            }</p><p><b>${
              room.giaTien != null
                ? room.giaTien.toLocaleString("vi-VN") + " đ/đêm"
                : "Liên hệ giá"
            }</b></p>`
          );
          renderedCount++;
        } catch (e) {
          console.error(
            `[RoomLocation] Error creating marker for room ${room.id}:`,
            e
          );
        }
      } else {
        console.warn(
          `[RoomLocation] ROOM API: Invalid coordinates for room ${room.id}...`
        );
      }
    });
    console.log(`[RoomLocation] Rendered ${renderedCount} markers.`);
  };

  const handleDetail = (roomId) => {
    if (roomId !== null && roomId !== undefined) {
      navigate(`/detailroom/${roomId}`);
    } else {
      console.error("[RoomLocation] Invalid roomId for navigation:", roomId);
    }
  };
  // *** KẾT THÚC HÀM HELPER ĐẦY ĐỦ ***

  // --- Phần Render ---

  // Hiển thị loading ban đầu
  const isInitialLoading =
    locationLoading === "loading" || locationLoading === true; // Check cả boolean và string
  if (isInitialLoading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  // Hiển thị lỗi tải địa điểm
  if (locationError) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <strong>Lỗi tải danh sách địa điểm:</strong> {locationError}
      </div>
    );
  }

  // Hiển thị nếu không có dữ liệu địa điểm nào từ API (sau khi đã load xong)
  const isLoadFinishedWithoutData =
    !isInitialLoading && (!locations || locations.length === 0);
  if (isLoadFinishedWithoutData) {
    return (
      <div className="p-4 text-center text-gray-600">
        Không có dữ liệu địa điểm nào được tìm thấy trong hệ thống.
      </div>
    );
  }

  return (
    <div className="room-location p-4">
      <h2 className="text-2xl font-semibold mb-5">
        Chỗ ở tại {cityName || slugParamFromUrl}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="room-list flex flex-col gap-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* *** JSX HOÀN CHỈNH CHO CÁC TRẠNG THÁI *** */}
          {/* 1. Khi không tìm thấy địa điểm khớp slug */}
          {maViTri === null && !isInitialLoading && slugParamFromUrl && (
            <div className="p-4 border border-orange-300 bg-orange-50 rounded-lg text-orange-700 text-center">
              <p>Không tìm thấy thông tin cho địa điểm "{slugParamFromUrl}".</p>
            </div>
          )}
          {/* 2. Khi đang tải phòng (đã có maViTri) */}
          {maViTri !== null &&
            roomLoading === "loading" &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border p-4 rounded-lg shadow bg-white animate-pulse"
              >
                <div className="w-full h-48 md:h-60 rounded-lg mb-3 bg-gray-300"></div>
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          {/* 3. Khi tải phòng thất bại */}
          {maViTri !== null && roomLoading === "failed" && (
            <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-700">
              <p className="font-semibold">Lỗi tải danh sách phòng:</p>
              <p>{roomError || "Đã xảy ra lỗi không xác định."}</p>
            </div>
          )}
          {/* 4. Khi tải phòng thành công nhưng không có phòng */}
          {maViTri !== null &&
            roomLoading === "succeeded" &&
            rooms &&
            rooms.length === 0 && (
              <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-700 text-center">
                <p>Hiện chưa có phòng nào tại khu vực "{cityName}".</p>
              </div>
            )}
          {/* 5. Khi tải phòng thành công và có phòng */}
          {maViTri !== null &&
            roomLoading === "succeeded" &&
            rooms &&
            rooms.length > 0 &&
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleDetail(room.id)}
                className="border p-4 rounded-lg shadow hover:shadow-xl transition duration-200 cursor-pointer bg-white flex flex-col sm:flex-row gap-4 items-start"
              >
                <img
                  src={room.hinhAnh || "/placeholder-image.png"}
                  alt={`Hình ảnh ${room.tenPhong || "phòng"}`}
                  className="w-full sm:w-1/3 lg:w-2/5 xl:w-1/3 h-48 sm:h-40 object-cover rounded-lg bg-gray-200 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image-error.png";
                  }}
                />
                <div className="flex flex-col justify-between flex-grow mt-2 sm:mt-0">
                  <div>
                    <h3
                      className="text-lg font-semibold mb-1 line-clamp-2 hover:text-red-500"
                      title={room.tenPhong}
                    >
                      {room.tenPhong || "Phòng chưa đặt tên"}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                      {room.moTa || "Không có mô tả chi tiết."}
                    </p>
                  </div>
                  <span className="text-lg font-bold mt-1 text-red-600 self-start sm:self-end">
                    {room.giaTien != null
                      ? `${room.giaTien.toLocaleString("vi-VN")} đ/đêm`
                      : "Liên hệ giá"}
                  </span>
                </div>
              </div>
            ))}
          {/* *** KẾT THÚC JSX HOÀN CHỈNH *** */}
        </div>
        {/* Cột bản đồ */}
        <div className="map-wrapper lg:sticky top-[80px] h-[50vh] lg:h-[calc(100vh-100px)] rounded-lg overflow-hidden shadow-lg border bg-gray-100">
          <div
            ref={mapContainer}
            className="map-container w-full h-full"
            aria-label={`Bản đồ vị trí các phòng tại ${
              cityName || slugParamFromUrl
            }`}
          />
          {/* Overlay loading map */}
          {roomLoading === "loading" && maViTri !== null && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10 pointer-events-none">
              <p className="text-gray-700 font-medium">
                Đang tải dữ liệu bản đồ...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomLocation;
// --- END OF FILE RoomLocation/index.jsx ---
