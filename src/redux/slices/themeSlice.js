import { createSlice } from "@reduxjs/toolkit";
import { theme as lightTheme, darkTheme } from "../../utils/theme.js";
import { emptyStore } from "../actions.js";

const initialState = {
  mode: "light",
  colors: {
    ...lightTheme.colors,
  },
};

const themeSlice = createSlice({
  name: "theme-color",
  initialState: initialState,
  reducers: {
    changePrimaryColor: (state, action) => {
      const color = action?.payload;
      if (!state.colors) {
        state.colors = { ...lightTheme.colors };
      }
      state.colors.primary = color;
      if (state.mode === "light") {
        state.colors.sidebarBg = color;
      }
    },
    changeTheme: (state, action) => {
      const nextMode =
        action.payload || (state.mode === "light" ? "dark" : "light");
      state.mode = nextMode;
      const targetColors =
        nextMode === "dark" ? darkTheme.colors : lightTheme.colors;

      // Preserve current primary color
      const currentPrimary = state.colors?.primary || targetColors.primary;

      state.colors = {
        ...targetColors,
        primary: currentPrimary,
      };

      // Resolve sidebarBg
      if (nextMode === "light") {
        state.colors.sidebarBg = currentPrimary;
      }
    },
  },
  // extraReducers(builder) {
  //   if (emptyStore) {
  //     builder.addCase(emptyStore, () => {
  //       return {
  //         mode: "light",
  //         colors: { ...lightTheme.colors },
  //       };
  //     });
  //   }
  // },
});

export const { changePrimaryColor, changeTheme } = themeSlice.actions;
export default themeSlice.reducer;
