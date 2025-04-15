import axios from "axios";

const BASE_URL = "https://airbnbnew.cybersoft.edu.vn/api";
const TOKEN_CYBERSOFT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJOT0RFSlMgNTAiLCJIZXRIYW5TdHJpbmciOiIwMi8xMC8yMDI1IiwiSGV0SGFuVGltZSI6IjE3NTkzNjMyMDAwMDAiLCJuYmYiOjE3NDA4NDg0MDAsImV4cCI6MTc1OTUxMDgwMH0.f98XSLVNOxLSj8VvAmW5aDwnFeCxgcK_cCeBu6jlVkU";

const api = axios.create({ baseURL: BASE_URL });

// Request Interceptor (Gắn token - Giữ nguyên)
api.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      TokenCybersoft: TOKEN_CYBERSOFT,
      "Content-Type": "application/json",
    };
    const userInfoString = localStorage.getItem("userInfo"); // Đọc từ key userInfo (đã thống nhất)
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString); // { user, token }
        const token = userInfo?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Lỗi đọc userInfo:", e);
        localStorage.removeItem("userInfo");
      }
    }
    return config;
  },
  (error) => {
    console.error("Lỗi Request Interceptor:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Chỉ log lỗi và reject, KHÔNG xử lý logout/redirect
api.interceptors.response.use(
  (response) => response, // Trả về response nếu thành công
  (error) => {
    if (error.response) {
      console.error(
        `API Error ${error.response.status}:`,
        error.response.data || error.message
      );
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn(
          "Interceptor: Token không hợp lệ hoặc hết hạn. Cần xử lý logout ở nơi gọi API."
        );
        // *** KHÔNG dispatch logout, KHÔNG redirect ***
        // Lỗi sẽ được trả về qua reject để nơi gọi xử lý
      }
    } else {
      console.error("Lỗi mạng hoặc không có response:", error.message);
    }
    // Luôn reject lỗi
    return Promise.reject(error);
  }
);

export default api; // Export default
