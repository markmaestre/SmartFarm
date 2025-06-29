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
      return rejectWithValue(error.response.data.message || 'Error creating market post');
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
      return rejectWithValue(error.response.data.message || 'Error fetching posts');
    }
  }
);

export const fetchMarketPostById = createAsyncThunk(
  'market/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/market/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error fetching post');
    }
  }
);

export const updateMarketPost = createAsyncThunk(
  'market/updatePost',
  async ({ id, formData, token }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/market/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.post;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error updating post');
    }
  }
);

export const deleteMarketPost = createAsyncThunk(
  'market/deletePost',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/market/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id; 
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Error deleting post');
    }
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState: {
    posts: [],
    selectedPost: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedPost: (state) => {
      state.selectedPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createMarketPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMarketPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.push(action.payload);
      })
      .addCase(createMarketPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH ALL
      .addCase(fetchMarketPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchMarketPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(fetchMarketPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchMarketPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(updateMarketPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMarketPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        );
      })
      .addCase(updateMarketPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(deleteMarketPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMarketPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter((post) => post._id !== action.payload);
      })
      .addCase(deleteMarketPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedPost } = marketSlice.actions;
export default marketSlice.reducer;
