// /Room_Booking/src/pages/HomeTemplate/Paying/index.jsx
import React, { useState, useEffect } from "react"; // *** THÊM useEffect ***
import { useLocation, useNavigate } from "react-router-dom";
import "./Paying.css";

function Paying() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State Quản lý ---
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Lấy dữ liệu từ state, KHÔNG dùng fallback ở đây nữa, sẽ kiểm tra sau
  const [bookingDetails, setBookingDetails] = useState(location.state || null);
  // State để kiểm soát việc cho phép thanh toán sau khi xác thực
  const [allowPayment, setAllowPayment] = useState(false);

  // Tạo Order ID duy nhất (chỉ tạo khi có bookingDetails hợp lệ)
  const [orderId, setOrderId] = useState("");

  // Lấy URL Backend
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8888";

  // --- VALIDATION EFFECT ---
  useEffect(() => {
    console.log("[FE Paying] Checking received state:", location.state);
    // Kiểm tra xem có state được truyền qua không
    if (!location.state) {
      console.error(
        "[FE Paying] Validation Failed: No booking details received via state."
      );
      setErrorMessage(
        "Lỗi: Không tìm thấy thông tin đặt phòng hợp lệ. Vui lòng quay lại trang chi tiết phòng và đặt lại."
      );
      setAllowPayment(false); // Không cho phép thanh toán
      // Optional: Tự động redirect về trang chủ sau vài giây
      const timer = setTimeout(() => navigate("/"), 5000); // Redirect về home sau 5s
      return () => clearTimeout(timer); // Cleanup timer nếu component unmount
    } else {
      // Có state, kiểm tra các trường cần thiết
      const details = location.state;
      // Cố gắng parse lại giá tiền nếu nó là string
      let amountVND = 0;
      if (
        details.totalAmountVND &&
        typeof details.totalAmountVND === "string"
      ) {
        amountVND = parseInt(details.totalAmountVND, 10) || 0;
      } else if (typeof details.totalAmountVND === "number") {
        amountVND = details.totalAmountVND;
      }

      // Kiểm tra các trường quan trọng (đặc biệt là giá tiền)
      if (!details.roomId || !amountVND || amountVND <= 1000) {
        console.error(
          "[FE Paying] Validation Failed: Invalid data in received state.",
          { roomId: details.roomId, amountVND }
        );
        setErrorMessage(
          `Lỗi: Thông tin đặt phòng không hợp lệ hoặc số tiền không hợp lệ (Số tiền: ${amountVND} VND). Vui lòng đặt lại.`
        );
        setAllowPayment(false);
        const timer = setTimeout(() => navigate("/"), 5000); // Redirect về home sau 5s
        return () => clearTimeout(timer);
      } else {
        // Dữ liệu hợp lệ
        console.log("[FE Paying] Validation Passed. Booking details:", details);
        // Cập nhật state bookingDetails với dữ liệu đã xác thực (bao gồm giá tiền đã parse)
        setBookingDetails({ ...details, totalAmountVND: amountVND });
        setOrderId(`PAY_${details.roomId}_${Date.now()}`); // Tạo orderId khi dữ liệu hợp lệ
        setAllowPayment(true); // Cho phép thanh toán
        setErrorMessage(""); // Xóa lỗi cũ nếu có
      }
    }
  }, [location.state, navigate]); // Chạy lại khi location.state thay đổi

  // --- Hàm xử lý khi nhấn nút thanh toán ---
  const handlePayment = async () => {
    // Chỉ thực hiện nếu allowPayment là true và không đang loading
    if (!allowPayment || isLoading) {
      console.warn("[FE HandlePayment] Payment disallowed or already loading.");
      return;
    }
    // Kiểm tra lại lần cuối (dù đã có trong useEffect)
    if (
      !bookingDetails ||
      !bookingDetails.totalAmountVND ||
      bookingDetails.totalAmountVND <= 1000
    ) {
      setErrorMessage("Lỗi: Dữ liệu thanh toán không hợp lệ.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const paymentData = {
      orderId: orderId, // Sử dụng orderId đã tạo
      amount: bookingDetails.totalAmountVND,
      orderInfo: `Thanh toan ${
        bookingDetails.roomName || "phong"
      } ma ${orderId}`,
      // userId: bookingDetails.userId
    };

    console.log("[FE] Sending payment request to backend:", paymentData);
    console.log(
      `[FE] Target Backend URL: ${backendUrl}/api/payments/create-vnpay-url`
    );

    try {
      const response = await fetch(
        `${backendUrl}/api/payments/create-vnpay-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );
      const responseData = await response.json();
      console.log("[FE] Received response from Backend:", responseData);

      if (!response.ok || responseData.code !== "00") {
        const message =
          responseData.message ||
          `Lỗi ${response.status} khi tạo URL thanh toán.`;
        console.error("[FE] Error from backend:", message);
        throw new Error(message);
      }
      if (responseData.paymentUrl) {
        console.log("[FE] Redirecting to VNPAY URL...");
        window.location.href = responseData.paymentUrl;
      } else {
        console.error("[FE] Error: No paymentUrl received from backend.");
        throw new Error("Không nhận được URL thanh toán.");
      }
    } catch (error) {
      console.error("[FE] VNPAY Payment Initiation Failed:", error);
      setErrorMessage(`Lỗi: ${error.message}. Vui lòng thử lại.`);
      setIsLoading(false);
    }
  };

  // --- Render Giao diện ---
  // Hiển thị nội dung chính chỉ khi allowPayment là true và có bookingDetails
  const renderContent = () => {
    if (!allowPayment || !bookingDetails) {
      // Hiển thị lỗi hoặc thông báo loading/redirecting
      return (
        <div className="paying-container">
          <h1>Xác nhận Thanh toán</h1>
          {errorMessage ? (
            <div className="error-message">{errorMessage}</div>
          ) : (
            <p className="loading-message">
              Đang kiểm tra thông tin đặt phòng...
            </p>
          )}
          <button className="pay-button vnpay-button" disabled={true}>
            Thanh toán ngay qua VNPAY
          </button>
        </div>
      );
    }

    // Nếu allowPayment là true và có bookingDetails
    return (
      <div className="paying-container">
        <h1>Xác nhận Thanh toán</h1>
        <div className="order-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <p>
            <strong>Phòng:</strong> {bookingDetails.roomName || "N/A"}
          </p>
          {bookingDetails.checkIn && bookingDetails.checkOut && (
            <p>
              <strong>Thời gian:</strong> {bookingDetails.checkIn} -{" "}
              {bookingDetails.checkOut}
            </p>
          )}
          {bookingDetails.guests && (
            <p>
              <strong>Số khách:</strong> {bookingDetails.guests}
            </p>
          )}
          <p>
            <strong>Mã thanh toán:</strong> {orderId}
          </p>
          <p>
            <strong>Số tiền:</strong>
            <strong style={{ color: "red", marginLeft: "5px" }}>
              {(bookingDetails.totalAmountVND || 0).toLocaleString("vi-VN")} VND
            </strong>
          </p>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <button
          className="pay-button vnpay-button"
          onClick={handlePayment}
          disabled={isLoading || !allowPayment} // Disable khi loading hoặc không được phép
        >
          {isLoading ? "Đang xử lý..." : "Thanh toán ngay qua VNPAY"}
        </button>

        <p
          style={{
            fontSize: "0.8em",
            color: "#666",
            marginTop: "15px",
            textAlign: "center",
          }}
        >
          Bạn sẽ được chuyển đến cổng thanh toán bảo mật VNPAY.
        </p>
      </div>
    );
  };

  return renderContent(); // Gọi hàm render
}

export default Paying;
