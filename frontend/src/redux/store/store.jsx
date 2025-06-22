import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlice";
import farmDiaryReducer from "../slices/farmDiarySlice";
import marketReducer from '../slices/marketSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    farmDiary: farmDiaryReducer,
    market: marketReducer,
  },
});
