import { configureStore } from "@reduxjs/toolkit";
import { foodApi } from "./foodApi";

export const store = configureStore({
  reducer: {
    [foodApi.reducerPath]: foodApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(foodApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;