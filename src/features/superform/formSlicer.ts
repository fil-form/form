import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findEmpty } from "./parse";
const { JSONPath } = require("jsonpath-plus");

export type pathType = (string | number)[];

export type Data = {
  [key: string]: (Data | string)[] | (Data | string);
};

const initialState: Data = {};
type Errors = {
  [key: string]: string;
};

export const formSlice = createSlice({
  name: "form",
  initialState: {
    data: initialState,
    errors: {} as Errors,
    empty: [] as string[],
  },
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    changeValue: (
      state,
      action: PayloadAction<{ p: pathType; v: string | number }>
    ) => {
      JSONPath({
        path: action.payload.p,
        json: state.data,
        callback: (e: any, b: any, c: any) => {
          c.parent[c.parentProperty] = action.payload.v;
        },
      });

      state.empty = Array.from(findEmpty(state.data));
    },
    applyXML: (state, action: PayloadAction<Data>) => {
      state.data = action.payload;
      state.empty = Array.from(findEmpty(state.data));
    },
  },
});

export const { changeValue, applyXML } = formSlice.actions;
export default formSlice.reducer;
