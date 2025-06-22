import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../Utils/axiosInstance";

export const fetchDiaries = createAsyncThunk("farmDiary/fetchDiaries", async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const res = await axios.get("/farmdiary", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
});

export const addDiary = createAsyncThunk("farmDiary/addDiary", async (diary, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const res = await axios.post("/farmdiary", diary, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
});

export const updateDiary = createAsyncThunk("farmDiary/updateDiary", async ({ id, data }, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  const res = await axios.put(`/farmdiary/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
});

export const deleteDiary = createAsyncThunk("farmDiary/deleteDiary", async (id, thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  await axios.delete(`/farmdiary/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return id;
});

const farmDiarySlice = createSlice({
  name: "farmDiary",
  initialState: {
    diaries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiaries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDiaries.fulfilled, (state, action) => {
        state.loading = false;
        state.diaries = action.payload;
      })
      .addCase(fetchDiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addDiary.fulfilled, (state, action) => {
        state.diaries.unshift(action.payload);
      })
      .addCase(updateDiary.fulfilled, (state, action) => {
        const index = state.diaries.findIndex(d => d._id === action.payload._id);
        if (index !== -1) state.diaries[index] = action.payload;
      })
      .addCase(deleteDiary.fulfilled, (state, action) => {
        state.diaries = state.diaries.filter(d => d._id !== action.payload);
      });
  },
});

export default farmDiarySlice.reducer;
