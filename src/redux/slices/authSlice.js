import { createSlice } from "@reduxjs/toolkit";
import { emptyStore } from "../actions.js";
import Cookies from "js-cookie";

const initialState = {
  token: null,
  userId: null,
  userData: null,
  role: null,
};

export const CookiesRemove = () => {
  Cookies.remove("token");
  Cookies.remove("use_role");
  if (typeof window !== "undefined") {
    try {
      sessionStorage.clear();
      localStorage.removeItem("persist:root");
    } catch (e) {
      console.error("Error clearing browser session:", e);
    }
  }
};

const secureSetCookie = (key, value) => {
  if (!key || value === undefined || value === null) return;
  Cookies.set(key, typeof value === "string" ? value : JSON.stringify(value), {
    expires: 7,
  });
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logingAuth: (state, action) => {
      const payload = action?.payload || {};
      const userData = payload.userData || {};
      const token = payload.token || userData.session?.access_token || null;
      const userId = payload.userId || userData.user?.id || userData.id || null;
      const role = payload.role || userData.role || "user";

      state.token = token;
      state.userId = userId;
      state.role = role;
      state.userData = userData;

      if (token) secureSetCookie("token", token);
      if (role) secureSetCookie("use_role", role);
    },
    logoutUser: (state) => {
      CookiesRemove();
      state.token = null;
      state.userId = null;
      state.userData = null;
      state.role = null;
    },
    updateProfile: (state, action) => {
      state.userData = {
        ...state.userData,
        ...action?.payload,
      };
    },
  },
  extraReducers(builder) {
    builder.addCase(emptyStore, () => {
      CookiesRemove();
      return initialState;
    });
  },
});

export const { logingAuth, logoutUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
