import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { token: null, user: null },
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
  },
});

export const { setLogin, setLogout, updateUser } = authSlice.actions;

export default authSlice.reducer;
