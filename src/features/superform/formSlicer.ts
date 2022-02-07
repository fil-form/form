import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const { JSONPath } = require("jsonpath-plus");

export type pathType = (string | number)[];

export type Data = {
  [key: string]: (Data | string)[] | (Data | string);
};

const initialState: Data = {};

export const formSlice = createSlice({
  name: "form",
  initialState: {
    data: initialState,
  },
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    changeValue: (
      state,
      action: PayloadAction<{ p: pathType; v: string | number }>
    ) => {
      // console.log(action.payload);
      JSONPath({
        path: action.payload.p,
        json: state.data,
        callback: (e: any, b: any, c: any) => {
          c.parent[c.parentProperty] = action.payload.v;
          console.log(c.parent);
        },
      });
    },
    applyXML: (state, action: PayloadAction<Data>) => {
      state.data = action.payload;
    },
  },
});

export const { changeValue, applyXML } = formSlice.actions;
export default formSlice.reducer;
