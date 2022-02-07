import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import form from "../features/superform/formSlicer";

export const store = configureStore({
  reducer: {
    form,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
