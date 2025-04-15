import { configureStore } from "@reduxjs/toolkit";
import locationListReducer from "./../pages/HomeTemplate/LocationList/slice";
import roomListReducer from "./../pages/HomeTemplate/RoomList/slice";
import roomLocationReducer from "./../pages/HomeTemplate/RoomLocation/slice";
import detailRoomReducer from "./../pages/HomeTemplate/DetailRoom/slice";
import loginReducer from "../pages/HomeTemplate/Login/slice";
import registerReducer from "../pages/HomeTemplate/Register/slice";
import profileReducer from "../pages/HomeTemplate/Profile/slice";

// import loginReducer from "./../pages/HomeTemplate/Login/slice";

const store = configureStore({
  reducer: {
    locationListReducer,
    roomListReducer,
    roomLocationReducer,
    detailRoomReducer,
    loginReducer,
    registerReducer,
    profileReducer,
  },
});
export default store;
