// /Room_Booking/src/pages/HomeTemplate/index.jsx (Hoặc tên file layout của bạn)

import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
// *** THÊM DÒNG NÀY ĐỂ IMPORT useDispatch và useSelector ***
import { useDispatch, useSelector } from "react-redux";
// *** Đảm bảo đường dẫn này đúng đến locationSlice của bạn ***
import { fetchLocations } from "./LocationList/slice"; // Giả sử đường dẫn này đúng
import Header from "./_Component/Header";
import Footer from "./_Component/Footer";

function HomeTemplate() {
  const dispatch = useDispatch(); // Bây giờ hàm này đã được định nghĩa
  const locationLoading = useSelector(
    (state) => state.locationListReducer.loading
  );
  const locations = useSelector((state) => state.locationListReducer.locations);

  useEffect(() => {
    // *** Logic kiểm tra shouldFetch như cũ ***
    const shouldFetch =
      locationLoading !== "loading" &&
      locationLoading !== "succeeded" &&
      (!locations || locations.length === 0);
    // Hoặc nếu dùng boolean: const shouldFetch = !locationLoading && (!locations || locations.length === 0);

    if (shouldFetch) {
      console.log("[HomeTemplate] Dispatching fetchLocations...");
      dispatch(fetchLocations());
    } else {
      console.log(
        `[HomeTemplate] Skipping fetchLocations. Status: ${locationLoading}, Locations length: ${locations?.length}`
      );
    }
  }, [dispatch, locationLoading, locations]);

  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default HomeTemplate;
