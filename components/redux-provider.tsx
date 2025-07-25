"use client"

import { Provider } from "react-redux";
import { store } from "../lib/store/store";
import React from "react";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
