// src/pages/HomeTemplate/Profile/slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api";
import { message } from "antd";
import { logout, updateLoginUser } from "../Login/slice";

// --- Thunks (fetchUserProfile, updateUserProfile, fetchUserBookingHistory) ---
// (Giữ nguyên code các thunks này như file bạn đã cung cấp)
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (userId, { rejectWithValue, dispatch }) => {
    if (!userId) return rejectWithValue({ message: "User ID is required." });
    try {
      const response = await api.get(`/users/${userId}`);
      if (response.data.statusCode === 200 && response.data.content) {
        return response.data.content;
      } else {
        return rejectWithValue({
          message:
            response.data.content || "Không thể lấy thông tin người dùng.",
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.content ||
        error.message ||
        "Lỗi tải thông tin cá nhân.";
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof logout === "function") dispatch(logout());
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message: msg });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async ({ userId, userData }, { rejectWithValue, dispatch }) => {
    if (!userId || !userData)
      return rejectWithValue({ message: "User ID and data are required." });
    try {
      const response = await api.put(`/users/${userId}`, userData);
      if (response.data.statusCode === 200 && response.data.content) {
        message.success("Cập nhật thông tin thành công!");
        if (typeof updateLoginUser === "function") {
          dispatch(
            updateLoginUser({
              name: response.data.content.name,
              email: response.data.content.email,
            })
          );
        }
        return response.data.content;
      } else {
        return rejectWithValue({
          message: response.data.content || "Cập nhật thất bại.",
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.content ||
        error.message ||
        "Lỗi khi cập nhật thông tin.";
      message.error(msg);
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof logout === "function") dispatch(logout());
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message: msg });
    }
  }
);

export const fetchUserBookingHistory = createAsyncThunk(
  "profile/fetchUserBookingHistory",
  async (userId, { rejectWithValue, dispatch }) => {
    if (!userId) return rejectWithValue({ message: "User ID is required." });
    try {
      const response = await api.get(
        `/dat-phong/lay-theo-nguoi-dung/${userId}`
      );
      if (
        response.data.statusCode === 200 &&
        Array.isArray(response.data.content)
      ) {
        return response.data.content;
      } else if (
        response.data.statusCode === 404 ||
        response.data.message?.toLowerCase().includes("không tìm thấy")
      ) {
        return [];
      } else {
        return rejectWithValue({
          message: response.data.content || "Không thể lấy lịch sử đặt phòng.",
        });
      }
    } catch (error) {
      const msg =
        error.response?.data?.content ||
        error.message ||
        "Lỗi tải lịch sử đặt phòng.";
      if (error.response?.status === 404) return [];
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (typeof logout === "function") dispatch(logout());
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message: msg });
    }
  }
);
// ----------------------------------------------------------------------------

// --- Initial State (Đã xóa phần transaction) ---
const initialState = {
  profileData: null,
  loadingProfile: false,
  errorProfile: null,
  bookingHistory: [],
  loadingHistory: false,
  errorHistory: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

// --- Slice Definition ---
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileState: (state) => {
      // Reset tất cả state về giá trị ban đầu
      Object.assign(state, initialState);
    },
    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile Reducers (Giữ nguyên)
      .addCase(fetchUserProfile.pending, (s) => {
        s.loadingProfile = true;
        s.errorProfile = null;
      })
      .addCase(fetchUserProfile.fulfilled, (s, a) => {
        s.loadingProfile = false;
        s.profileData = a.payload;
      })
      .addCase(fetchUserProfile.rejected, (s, a) => {
        s.loadingProfile = false;
        if (a.payload?.status !== 401 && a.payload?.status !== 403)
          s.errorProfile = a.payload?.message;
        s.profileData = null;
      })
      // Update Profile Reducers (Giữ nguyên)
      .addCase(updateUserProfile.pending, (s) => {
        s.updateLoading = true;
        s.updateError = null;
        s.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (s, a) => {
        s.updateLoading = false;
        s.profileData = a.payload;
        s.updateSuccess = true;
        s.updateError = null;
      })
      .addCase(updateUserProfile.rejected, (s, a) => {
        s.updateLoading = false;
        if (a.payload?.status !== 401 && a.payload?.status !== 403)
          s.updateError = a.payload?.message;
        s.updateSuccess = false;
      })
      // Fetch Booking History Reducers (Giữ nguyên)
      .addCase(fetchUserBookingHistory.pending, (s) => {
        s.loadingHistory = true;
        s.errorHistory = null;
      })
      .addCase(fetchUserBookingHistory.fulfilled, (s, a) => {
        s.loadingHistory = false;
        s.bookingHistory = a.payload || [];
      })
      .addCase(fetchUserBookingHistory.rejected, (s, a) => {
        s.loadingHistory = false;
        if (a.payload?.status !== 401 && a.payload?.status !== 403)
          s.errorHistory = a.payload?.message;
        s.bookingHistory = [];
      });
    // *** KHÔNG CÓ REDUCERS CHO TRANSACTION NỮA ***
  },
});

export const { clearProfileState, clearUpdateStatus } = profileSlice.actions;
export default profileSlice.reducer;

// --- Selectors (Đã xóa phần transaction) ---
export const selectProfileData = (state) => state.profileReducer.profileData;
export const selectProfileLoading = (state) =>
  state.profileReducer.loadingProfile;
export const selectProfileError = (state) => state.profileReducer.errorProfile;
export const selectBookingHistory = (state) =>
  state.profileReducer.bookingHistory;
export const selectHistoryLoading = (state) =>
  state.profileReducer.loadingHistory;
export const selectHistoryError = (state) => state.profileReducer.errorHistory;
export const selectUpdateProfileLoading = (state) =>
  state.profileReducer.updateLoading;
export const selectUpdateProfileError = (state) =>
  state.profileReducer.updateError;
export const selectUpdateProfileSuccess = (state) =>
  state.profileReducer.updateSuccess;
