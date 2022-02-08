import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findEmpty } from "./parse";
const { JSONPath } = require("jsonpath-plus");
// const pointer = require("json-pointer");

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
    perc: 1,
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
      changePerc(state, state.perc)
      state.empty = Array.from(findEmpty(state.data));
    },
    applyXML: (state, action: PayloadAction<Data>) => {
      state.data = action.payload;
      changePerc(state, state.perc)
      state.empty = Array.from(findEmpty(state.data));
    },
    perc: (state, action: PayloadAction<number>) => {
      state.perc = action.payload
      changePerc(state, state.perc)
    }
  },
});

export const { changeValue, applyXML, perc } = formSlice.actions;
export default formSlice.reducer;


function changePerc<T>(data: T, perc: number) {
  JSONPath({
    path: `$..Supplies.Supply[*][FundingRequestAmount,FundingFirstAmount]`,
    json: data,
    callback: (e: any, b: any, c: any) => {
      const cess = Number.parseFloat(c.parent['CessionAmount'])
      if (cess) {
        c.parent[c.parentProperty] = (cess * perc).toString()
      }
    },
  });
}