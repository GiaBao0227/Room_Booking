import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./../../../services/api";

// Function to get selectedLocationId from localStorage
const getStoredLocationId = () => {
  try {
    const serializedValue = localStorage.getItem("selectedLocationId");
    return serializedValue === null ? null : JSON.parse(serializedValue);
  } catch (err) {
    return null;
  }
};

// Fetch danh sách địa điểm từ API
export const fetchLocations = createAsyncThunk(
  "location/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vi-tri");
      return response.data.content; // Giả sử API trả về dạng { content: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy dữ liệu địa điểm"
      );
    }
  }
);

const initialState = {
  locations: [],
  selectedLocation: null, // Thêm state để theo dõi địa điểm được chọn
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState: {
    locations: [],
    selectedLocation: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedLocation } = locationSlice.actions; // Xuất action setSelectedLocation
export default locationSlice.reducer;
