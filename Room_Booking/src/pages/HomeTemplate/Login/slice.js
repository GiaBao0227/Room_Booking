// src/pages/HomeTemplate/Login/slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api"; // Đảm bảo đường dẫn đúng

// Helper lấy user info (lưu dạng { user, token })
const getUserInfoFromStorage = () => {
  try {
    const s = localStorage.getItem("userInfo");
    if (s) {
      const d = JSON.parse(s);
      if (d && d.user && d.token) return d;
    }
  } catch (e) {
    localStorage.removeItem("userInfo");
  }
  return null;
};

// Thunk Login - Gọi API /api/auth/signin
export const loginUser = createAsyncThunk(
  "login/loginUser", // Prefix 'login'
  async (credentials, { rejectWithValue }) => {
    // credentials là { email, password }
    try {
      const response = await api.post("/auth/signin", credentials);
      const loginData = response.data.content; // { user: {...}, token: "..." }
      if (loginData && loginData.user && loginData.token) {
        localStorage.setItem("userInfo", JSON.stringify(loginData));
        return loginData;
      } else {
        return rejectWithValue(loginData?.message || "Thông tin không hợp lệ.");
      }
    } catch (error) {
      const eM =
        error.response?.data?.content || error.message || "Đăng nhập thất bại.";
      return rejectWithValue(eM);
    }
  }
);

const initialUserInfo = getUserInfoFromStorage();
const initialState = { loading: false, data: initialUserInfo, error: null };

// *** Slice tên là "login" ***
const loginSlice = createSlice({
  name: "login", // <-- Tên slice là 'login'
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("userInfo");
      console.log("LoginSlice: User logged out.");
    },
    clearLoginError: (state) => {
      state.error = null;
    },
    updateLoginUser: (state, action) => {
      if (state.data?.user && action.payload) {
        state.data.user = { ...state.data.user, ...action.payload };
        localStorage.setItem("userInfo", JSON.stringify(state.data));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
        s.error = null;
      })
      .addCase(loginUser.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
        s.data = null;
      });
  },
});

export const { logout, clearLoginError, updateLoginUser } = loginSlice.actions;
export default loginSlice.reducer;

export const selectLoginData = (state) => state.loginReducer.data;
export const selectUserData = (state) => state.loginReducer.data?.user;
export const selectUserToken = (state) => state.loginReducer.data?.token;
export const selectIsUserLoggedIn = (state) => !!state.loginReducer.data?.token;
export const selectLoginLoading = (state) => state.loginReducer.loading;
export const selectLoginError = (state) => state.loginReducer.error;
export const selectUserEmail = (state) => state.loginReducer.data?.user?.email; 
export const selectUserRoleFromLogin = (state) =>
  state.loginReducer.data?.user?.role; 
