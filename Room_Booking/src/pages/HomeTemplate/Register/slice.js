// src/pages/HomeTemplate/Register/slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api"; // Đảm bảo đường dẫn đúng

// Thunk gọi API Signup
// API đúng: POST /api/auth/signup
// Yêu cầu: name, email, password, phone, birthday(string YYYY-MM-DD), gender(boolean), role(string)
export const actRegister = createAsyncThunk(
  "register/actRegister",
  async (userData, { rejectWithValue }) => {
    try {
      // userData phải chứa các trường: name, email, password, phone, birthday, gender, role
      console.log("Registering user data for /auth/signup:", userData);

      // *** SỬA ENDPOINT THÀNH /auth/signup ***
      const response = await api.post("/auth/signup", userData); // <-- Endpoint chính xác

      console.log("Signup API Response:", response.data);

      // Kiểm tra response từ endpoint signup
      // Thông thường signup thành công sẽ trả về thông tin user vừa tạo trong content
      if (
        (response.data.statusCode === 200 ||
          response.data.statusCode === 201) &&
        response.data.content
      ) {
        // Trả về content (thông tin user hoặc chỉ message thành công)
        return response.data.content;
      } else {
        // Nếu API trả về lỗi có cấu trúc hoặc không có content
        return rejectWithValue(
          response.data.content?.message ||
            response.data.message ||
            "Đăng ký thất bại."
        );
      }
    } catch (error) {
      console.error("Signup API Error:", error.response?.data || error.message);
      // Endpoint signup có thể trả lỗi trong 'content' hoặc 'message'
      const errorMessage =
        error.response?.data?.content ||
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại.";
      return rejectWithValue(errorMessage);
    }
  }
);

// ... initialState, Slice, Reducers, ExtraReducers giữ nguyên ...
const initialState = { loading: false, data: null, error: null };
const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    resetRegister: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(actRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(actRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      }) // Lưu user info hoặc {success, message}
      .addCase(actRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.data = null;
      });
  },
});
export const { resetRegister } = registerSlice.actions;
export default registerSlice.reducer;
