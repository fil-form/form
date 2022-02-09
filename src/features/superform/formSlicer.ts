import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { findEmpty, findNumber } from "./parse";
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
    perc: 100,
    prefix: "",
    syncValues: {
      "$.Register.Supplies.Supply[*].FundingFirstDate": "",
      "$.Register.Supplies.Supply[*].FundingRequestDate": "",
    } as { [p: string]: string },
  },
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setSyncValue: (state, action: PayloadAction<{ p: string; v: string }>) => {
      state.syncValues[action.payload.p] = action.payload.v;
      syncValue(state.data, [action.payload.p, action.payload.v]);
      state.empty = Array.from(findEmpty(state.data));
    },
    changeValue: (
      state,
      action: PayloadAction<{ p: pathType | string; v: string | number }>
    ) => {
      JSONPath({
        path: action.payload.p,
        json: state.data,
        callback: (e: any, b: any, c: any) => {
          c.parent[c.parentProperty] = action.payload.v;
        },
      });
      changePerc(state, state.perc);
      state.empty = Array.from(findEmpty(state.data));
    },
    applyXML: (state, action: PayloadAction<Data>) => {
      state.data = action.payload;
      state.prefix = "";
      Object.keys(state.syncValues).forEach((k) => {
        state.syncValues[k] = "";
      });
      Object.entries(state.syncValues).forEach((value) =>
        syncValue(state.data, value)
      );
      changePerc(state, state.perc);
      state.empty = Array.from(findEmpty(state.data));
    },
    perc: (state, action: PayloadAction<number>) => {
      state.perc = action.payload;
      changePerc(state, state.perc);
    },
    setPrefix: (state, action: PayloadAction<string>) => {
      state.prefix = action.payload;
    },
    syncPrefix: (state, action: PayloadAction<string>) => {
      state.prefix = action.payload;
      _syncPrefix(state.data, action.payload);
      state.empty = Array.from(findEmpty(state.data));
    },
  },
});

export const {
  changeValue,
  applyXML,
  perc,
  setSyncValue,
  syncPrefix,
  setPrefix,
} = formSlice.actions;
export default formSlice.reducer;

function changePerc<T>(data: T, perc: number) {
  JSONPath({
    path: `$..Supplies.Supply[*][FundingRequestAmount,FundingFirstAmount]`,
    json: data,
    callback: (e: any, b: any, c: any) => {
      const cess = Number.parseFloat(c.parent["CessionAmount"]);
      if (cess) {
        c.parent[c.parentProperty] = (Math.round(cess * perc) / 100).toString();
      }
    },
  });
}

function syncValue<T>(data: T, [p, v]: [p: string, v: string]) {
  JSONPath({
    path: p,
    json: data,
    callback: (e: any, b: any, c: any) => {
      c.parent[c.parentProperty] = v;
    },
  });
}

function _syncPrefix<T>(data: T, prefix: string) {
  JSONPath({
    path: "$.Register.Supplies.Supply[*].FundingRequestNumber",
    json: data,
    callback: (e: any, b: any, c: any) => {
      const number = findNumber(c.parent);
      if (number.length > 0) {
        c.parent[c.parentProperty] = prefix + "_" + number;
      } else {
        c.parent[c.parentProperty] = "";
      }
    },
  });
}
