// /Room_Booking/src/pages/PaymentResult/PaymentFailed.jsx
import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css";
import moment from "moment";

// Hàm helper để lưu vào localStorage
const saveTransactionToLocalStorage = (details, status) => {
  try {
    const history = JSON.parse(
      localStorage.getItem("transactionHistory") || "[]"
    );
    const orderInfoParts = details.vnp_OrderInfo?.split(" ");
    const potentialOrderId =
      orderInfoParts?.length > 0
        ? orderInfoParts[orderInfoParts.length - 1]
        : null;
    const orderIdToSave = potentialOrderId?.startsWith("PAY_")
      ? potentialOrderId
      : details.vnp_TxnRef;

    const newTransaction = {
      id: details.vnp_TxnRef || `local_${Date.now()}`,
      status: status, // 'failed'
      transactionDate: moment().toISOString(),
      orderId: orderIdToSave,
      amount: details.vnp_Amount ? parseInt(details.vnp_Amount) / 100 : 0,
      vnpTransactionNo: details.vnp_TransactionNo || null,
      bankCode: details.vnp_BankCode || null,
      vnpResponseCode: details.vnp_ResponseCode || null, // Lưu mã lỗi VNPAY
      vnp_PayDate: details.vnp_PayDate || null,
    };
    history.unshift(newTransaction);
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem("transactionHistory", JSON.stringify(limitedHistory));
    console.log("Saved failed transaction to localStorage:", newTransaction);
  } catch (error) {
    console.error("Failed to save transaction to localStorage:", error);
  }
};

function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const transactionDetails = Object.fromEntries([...searchParams]);

  // GỌI HÀM LƯU KHI COMPONENT MOUNT
  useEffect(() => {
    saveTransactionToLocalStorage(transactionDetails, "failed");
  }, []); // Chỉ chạy 1 lần

  // Logic xử lý displayMessage giữ nguyên
  let displayMessage = "Giao dịch không thành công, đã bị hủy hoặc có lỗi.";

  // Check for specific errors passed from BE or VNPAY
  if (transactionDetails.error === "checksum_invalid") {
    displayMessage =
      "Lỗi: Dữ liệu VNPAY trả về không hợp lệ. Vui lòng liên hệ hỗ trợ.";
  } else if (transactionDetails.error === "server_config_error") {
    displayMessage =
      "Lỗi: Có lỗi cấu hình phía máy chủ. Vui lòng liên hệ hỗ trợ.";
  } else if (
    transactionDetails.vnp_ResponseCode &&
    transactionDetails.vnp_ResponseCode !== "00"
  ) {
    // Thêm các diễn giải mã lỗi phổ biến của VNPAY nếu muốn
    const vnpErrorCode = transactionDetails.vnp_ResponseCode;
    let reason = `Mã lỗi VNPAY: ${vnpErrorCode}.`;
    if (vnpErrorCode === "02")
      reason = "Giao dịch đã được gửi tới VNPAY nhưng chưa thành công.";
    if (vnpErrorCode === "07")
      reason = "Trừ tiền thành công nhưng giao dịch bị nghi ngờ gian lận.";
    if (vnpErrorCode === "09")
      reason = "Thẻ/Tài khoản chưa đăng ký Internet Banking tại ngân hàng.";
    if (vnpErrorCode === "10")
      reason = "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
    if (vnpErrorCode === "11") reason = "Đã hết hạn chờ thanh toán.";
    if (vnpErrorCode === "12") reason = "Thẻ/Tài khoản bị khóa.";
    if (vnpErrorCode === "13")
      reason = "Quý khách nhập sai mật khẩu xác thực (OTP).";
    if (vnpErrorCode === "24") reason = "Khách hàng hủy giao dịch.";
    if (vnpErrorCode === "51") reason = "Tài khoản không đủ số dư.";
    if (vnpErrorCode === "65")
      reason = "Tài khoản đã vượt quá hạn mức giao dịch trong ngày.";
    if (vnpErrorCode === "75") reason = "Ngân hàng thanh toán đang bảo trì.";
    displayMessage = `Giao dịch thất bại. ${reason}`;
  }

  return (
    <div className="payment-result-container failed">
      <h1>Thanh toán Thất Bại!</h1>
      <p>{displayMessage}</p>
      <div className="details-box">
        <h2>Chi tiết Phản hồi (VNPAY)</h2>
        <table className="details-table">
          <tbody>
            {Object.entries(transactionDetails).map(([key, value]) => (
              <tr key={key}>
                <td className="key-cell">{key}</td>
                <td className="value-cell">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/paying" className="result-button">
        {" "}
        Thử lại Thanh toán{" "}
      </Link>
      <Link to="/" className="result-button secondary">
        {" "}
        Về Trang Chủ{" "}
      </Link>
    </div>
  );
}
export default PaymentFailed;
