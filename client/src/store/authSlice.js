import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { token: null, user: null, theme: "light" },
  reducers: {
    setLogin: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setLogout: (state) => {
      state.token = null;
      state.user = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload.user;
    },
    updateTheme: (state, action) => {
      state.theme = action.payload.theme;
    },
  },
});

export const { setLogin, setLogout, updateUser, updateTheme } =
  authSlice.actions;

export default authSlice.reducer;
