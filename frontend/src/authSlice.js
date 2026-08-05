import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    updateCredits: (state, action) => {
      if (state.user) {
        state.user.credit = action.payload;
      }
    },

    updatePlan: (state, action) => {
      if (state.user) {
        state.user.plan = action.payload;
      }
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setUser,
  updateCredits,
  updatePlan,
  logout,
  setError,
} = authSlice.actions;

export default authSlice.reducer;