// /Room_Booking/src/pages/PaymentResult/PaymentSuccess.jsx
import React, { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./PaymentResult.css";
import moment from "moment";

// Hàm helper để lưu vào localStorage
const saveTransactionToLocalStorage = (details) => {
  try {
    const history = JSON.parse(
      localStorage.getItem("transactionHistory") || "[]"
    );
    // Cố gắng lấy orderId từ vnp_OrderInfo (ví dụ: "Thanh toan phong PAY_609_1717582889310")
    const orderInfoParts = details.vnp_OrderInfo?.split(" ");
    const potentialOrderId =
      orderInfoParts?.length > 0
        ? orderInfoParts[orderInfoParts.length - 1]
        : null;
    const orderIdToSave = potentialOrderId?.startsWith("PAY_")
      ? potentialOrderId
      : details.vnp_TxnRef; // Ưu tiên orderId tự tạo nếu có

    const newTransaction = {
      id: details.vnp_TxnRef || `local_${Date.now()}`, // Dùng vnp_TxnRef làm id chính
      status: "success",
      transactionDate: moment().toISOString(), // Lưu thời gian thành công (có thể dùng vnp_PayDate nếu muốn chính xác hơn)
      orderId: orderIdToSave,
      amount: details.vnp_Amount ? parseInt(details.vnp_Amount) / 100 : 0, // Lưu giá trị VND
      vnpTransactionNo: details.vnp_TransactionNo || null,
      bankCode: details.vnp_BankCode || null,
      vnp_PayDate: details.vnp_PayDate || null, // Lưu thêm PayDate nếu có
    };
    history.unshift(newTransaction);
    const limitedHistory = history.slice(0, 50); // Giới hạn 50 bản ghi
    localStorage.setItem("transactionHistory", JSON.stringify(limitedHistory));
    console.log(
      "Saved successful transaction to localStorage:",
      newTransaction
    );
  } catch (error) {
    console.error("Failed to save transaction to localStorage:", error);
  }
};

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const transactionDetails = Object.fromEntries([...searchParams]);

  // GỌI HÀM LƯU KHI COMPONENT MOUNT và Giao dịch thành công (Code = 00)
  useEffect(() => {
    if (transactionDetails.vnp_ResponseCode === "00") {
      saveTransactionToLocalStorage(transactionDetails);
    }
  }, []); // Chỉ chạy 1 lần

  const formatAmount = (key, value) => {
    if (key === "vnp_Amount" && value) {
      const amount = parseInt(value) / 100;
      return `${amount.toLocaleString("vi-VN")} VND`;
    }
    return value;
  };

  // Function to format date fields
  const formatDate = (key, value) => {
    if (key === "vnp_PayDate" && value && value.length === 14) {
      // Format: YYYYMMDDHHMMSS -> DD/MM/YYYY HH:MM:SS
      try {
        const year = value.substring(0, 4);
        const month = value.substring(4, 6);
        const day = value.substring(6, 8);
        const hour = value.substring(8, 10);
        const minute = value.substring(10, 12);
        const second = value.substring(12, 14);
        return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
      } catch {
        return value; // Return original if parsing fails
      }
    }
    return value;
  };

  return (
    <div className="payment-result-container success">
      <h1>Thanh toán Thành Công!</h1>
      <p>Cảm ơn bạn đã hoàn tất giao dịch qua VNPAY.</p>
      <p>Trạng thái đơn hàng sẽ được cập nhật trong hệ thống.</p>
      <div className="details-box">
        <h2>Chi tiết Giao dịch (VNPAY)</h2>
        <table className="details-table">
          <tbody>
            {Object.entries(transactionDetails).map(([key, value]) => (
              <tr key={key}>
                <td className="key-cell">{key}</td>
                <td className="value-cell">
                  {formatDate(key, formatAmount(key, value))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/" className="result-button">
        {" "}
        Về Trang Chủ{" "}
      </Link>
    </div>
  );
}
export default PaymentSuccess;
