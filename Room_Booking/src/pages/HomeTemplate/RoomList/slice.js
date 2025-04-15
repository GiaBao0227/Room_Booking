// RoomList/slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api";

export const fetchRooms = createAsyncThunk(
  "room/fetchRooms",
  async (locationId, { rejectWithValue }) => {
    // Thêm locationId làm tham số
    try {
      // Gọi API /phong-theo-vi-tri/{maViTri} (theo Swagger)
      const response = await api.get(`/phong-theo-vi-tri/${locationId}`);
      // Giả sử data trả về { statusCode, message, content: [ ... ] }
      return response.data.content; // Hoặc response.data tùy thuộc vào cấu trúc dữ liệu
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách phòng"
      );
    }
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roomSlice.reducer;
