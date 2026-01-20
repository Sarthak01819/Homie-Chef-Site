import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePage: "home",
};

const pageSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state.activePage = action.payload;
    },
  },
});

export const { setActivePage } = pageSlice.actions;
export default pageSlice.reducer;