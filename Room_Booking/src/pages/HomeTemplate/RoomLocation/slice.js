import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api";

// Thunk để fetch danh sách phòng theo mã vị trí (maViTri)
export const fetchRoomsLocation = createAsyncThunk(
  "roomLocation/fetchRoomsLocation",
  async (maViTri, { rejectWithValue }) => {
    try {
      // Gọi API lấy danh sách phòng theo vị trí
      const response = await api.get(
        `/phong-thue/lay-phong-theo-vi-tri?maViTri=${maViTri}`
      );
      // Quan trọng: Kiểm tra cấu trúc response.data.content ở đây nếu cần
      // console.log("API Response for rooms:", response.data);
      if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
      } else {
        console.error(
          "API response for rooms is not in expected format:",
          response.data
        );
        // Trả về mảng rỗng hoặc reject tùy vào logic mong muốn
        return rejectWithValue("Dữ liệu phòng trả về không đúng định dạng");
        // return [];
      }
    } catch (error) {
      console.error("Error fetching rooms by location:", error);
      const errorMessage =
        error.response?.data?.content || // Kiểm tra xem lỗi có message trong content không
        error.response?.data?.message ||
        error.message || // Lỗi mạng hoặc lỗi khác
        "Lỗi khi lấy danh sách phòng theo địa điểm";
      return rejectWithValue(errorMessage);
    }
  }
);

const roomLocationSlice = createSlice({
  name: "roomLocation",
  initialState: {
    list: [],
    loading: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    // Có thể thêm reducer để clear list phòng khi chuyển trang hoặc không tìm thấy vị trí
    // clearRoomList: (state) => {
    //   state.list = [];
    //   state.loading = 'idle';
    //   state.error = null;
    // }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoomsLocation.pending, (state) => {
        state.loading = "loading";
        state.error = null; // Xóa lỗi cũ khi bắt đầu tải
      })
      .addCase(fetchRoomsLocation.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.list = action.payload; // Gán dữ liệu mới
      })
      .addCase(fetchRoomsLocation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload; // Lưu thông báo lỗi
        state.list = []; // Xóa danh sách cũ khi có lỗi
      });
  },
});

// export const { clearRoomList } = roomLocationSlice.actions; // Export action nếu có thêm reducer

export default roomLocationSlice.reducer;
