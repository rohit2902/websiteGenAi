import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../authSlice.js";
import websiteReducer from "../features/user/websiteSlice.js"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    website: websiteReducer
  },
});