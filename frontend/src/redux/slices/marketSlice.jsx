import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../Utils/axiosInstance';

export const createMarketPost = createAsyncThunk(
  'market/createPost',
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/market', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.post;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchMarketPosts = createAsyncThunk(
  'market/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/market');
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createMarketPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMarketPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.push(action.payload);
      })
      .addCase(createMarketPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMarketPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      });
  },
});

export default marketSlice.reducer;
