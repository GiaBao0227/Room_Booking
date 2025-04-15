import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api";
import { logout } from "../Login/slice";

export const fetchDetailRoom = createAsyncThunk(
  "detailRoom/fetchDetailRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      // Endpoint API lấy chi tiết phòng (thay đổi nếu cần)
      const response = await api.get(`/phong-thue/${roomId}`);
      // Kiểm tra nếu API trả về lỗi trong content
      if (response.data.statusCode !== 200 || !response.data.content) {
        return rejectWithValue({
          message: response.data.message || "Không tìm thấy thông tin phòng",
        });
      }
      return response.data.content; // Trả về data phòng
    } catch (error) {
      const message =
        error.response?.data?.content ||
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tải thông tin phòng";
      return rejectWithValue({ message });
    }
  }
);

// Fetch bình luận của phòng
export const fetchRoomComments = createAsyncThunk(
  "detailRoom/fetchRoomComments",
  async (roomId, { rejectWithValue }) => {
    try {
      // Endpoint API lấy bình luận (thay đổi nếu cần)
      const response = await api.get(
        `/binh-luan/lay-binh-luan-theo-phong/${roomId}`
      );
      // Kiểm tra nếu API trả về lỗi trong content hoặc data rỗng
      if (response.data.statusCode !== 200) {
        // Nếu không có bình luận thì trả về mảng rỗng thay vì lỗi
        if (response.data.message?.toLowerCase().includes("không tìm thấy")) {
          return [];
        }
        return rejectWithValue({
          message: response.data.message || "Lỗi khi tải bình luận",
        });
      }
      return response.data.content || []; // Trả về mảng bình luận, hoặc mảng rỗng nếu content null
    } catch (error) {
      const message =
        error.response?.data?.content ||
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tải bình luận";
      // Nếu lỗi 404 (không tìm thấy) thì cũng trả về mảng rỗng
      if (error.response?.status === 404) {
        return [];
      }
      return rejectWithValue({ message });
    }
  }
);

// Post bình luận mới
export const postRoomComment = createAsyncThunk(
  "detailRoom/postRoomComment",
  async (commentData, { rejectWithValue, dispatch, getState }) => {
    try {
      // Không cần check auth ở đây vì đã check ở component
      // Endpoint API post bình luận (thay đổi nếu cần)
      const response = await api.post("/binh-luan", commentData);
      if (
        response.data.statusCode !== 200 &&
        response.data.statusCode !== 201
      ) {
        // Check cả 201 Created
        return rejectWithValue({
          message: response.data.message || "Gửi bình luận thất bại",
        });
      }
      // Post thành công, fetch lại comment list để cập nhật UI
      const currentRoomId = getState().detailRoom.data?.id; // Lấy id phòng hiện tại từ state
      if (currentRoomId) {
        dispatch(fetchRoomComments(currentRoomId)); // Fetch lại comment
      }
      return response.data.content; // Trả về comment đã post (nếu API trả về)
    } catch (error) {
      const message =
        error.response?.data?.content ||
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi gửi bình luận";
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        if (typeof logout === "function") dispatch(logout()); // Dispatch logout của loginSlice
        return rejectWithValue({
          message: "Phiên đăng nhập hết hạn.",
          status: error.response.status,
        });
      }
      return rejectWithValue({ message });
    }
  }
);

const initialState = {
  data: null,
  loading: false,
  error: null,
  comments: [],
  commentsLoading: false,
  commentsError: null,
  postCommentLoading: false,
  postCommentError: null,
};

const detailRoomSlice = createSlice({
  name: "detailRoom",
  initialState,
  reducers: {
    // Action để xóa state khi rời khỏi trang
    clearDetailRoomState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
      state.comments = [];
      state.commentsLoading = false;
      state.commentsError = null;
      state.postCommentLoading = false;
      state.postCommentError = null;
    },
    // Action để xóa lỗi post comment (nếu cần)
    clearPostCommentError: (state) => {
      state.postCommentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchDetailRoom
      .addCase(fetchDetailRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDetailRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDetailRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi không xác định";
        state.data = null; // Reset data nếu fetch lỗi
      })

      // Cases for fetchRoomComments
      .addCase(fetchRoomComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(fetchRoomComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload || []; // Đảm bảo là mảng
      })
      .addCase(fetchRoomComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload?.message || "Lỗi tải bình luận";
        state.comments = []; // Reset comments nếu fetch lỗi
      })

      // Cases for postRoomComment
      .addCase(postRoomComment.pending, (state) => {
        state.postCommentLoading = true;
        state.postCommentError = null;
      })
      .addCase(postRoomComment.fulfilled, (state, action) => {
        state.postCommentLoading = false;
        // Không cần thêm comment vào state ở đây vì đã fetch lại list mới
      })
      .addCase(postRoomComment.rejected, (state, action) => {
        state.postCommentLoading = false;
        state.postCommentError = action.payload?.message || "Lỗi gửi bình luận";
      });
  },
});

// Export actions và reducer
export const { clearDetailRoomState, clearPostCommentError } =
  detailRoomSlice.actions;
export default detailRoomSlice.reducer;
export const selectDetailRoomData = (state) => state.detailRoomReducer.data;
export const selectDetailRoomLoading = (state) =>
  state.detailRoomReducer.loading;
export const selectDetailRoomError = (state) => state.detailRoomReducer.error;
export const selectRoomComments = (state) => state.detailRoomReducer.comments;
export const selectCommentsLoading = (state) =>
  state.detailRoomReducer.commentsLoading;
