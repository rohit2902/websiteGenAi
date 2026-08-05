import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  websites: [],
  currentWebsite: null,
  conversation: [],
  loading: false,
  isEditing: false,
  error: null,
};

const websiteSlice = createSlice({
  name: "website",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setIsEditing: (state, action) => {
      state.isEditing = action.payload;
    },

    setWebsites: (state, action) => {
      state.websites = action.payload;
    },

    setCurrentWebsite: (state, action) => {
      state.currentWebsite = action.payload;
    },

    setConversation: (state, action) => {
      state.conversation = action.payload;
    },

    addMessage: (state, action) => {
      state.conversation.push(action.payload);
    },

    addWebsite: (state, action) => {
      state.websites.unshift(action.payload);
    },

    updateWebsite: (state, action) => {
      const targetId = action.payload._id || action.payload.id;
      state.websites = state.websites.map((website) =>
        (website._id || website.id) === targetId ? action.payload : website
      );

      if ((state.currentWebsite?._id || state.currentWebsite?.id) === targetId) {
        state.currentWebsite = action.payload;
      }
    },

    removeWebsite: (state, action) => {
      state.websites = state.websites.filter(
        (website) => (website._id || website.id) !== action.payload
      );

      if ((state.currentWebsite?._id || state.currentWebsite?.id) === action.payload) {
        state.currentWebsite = null;
        state.conversation = [];
      }
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearWebsiteState: (state) => {
      state.websites = [];
      state.currentWebsite = null;
      state.conversation = [];
      state.loading = false;
      state.isEditing = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setIsEditing,
  setWebsites,
  setCurrentWebsite,
  setConversation,
  addMessage,
  addWebsite,
  updateWebsite,
  removeWebsite,
  setError,
  clearWebsiteState,
} = websiteSlice.actions;

export default websiteSlice.reducer;