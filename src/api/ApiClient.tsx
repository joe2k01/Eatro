import React, { createContext, useContext } from "react";
import { ApiClient } from "./client";

type ApiClientContex = {
  client: ApiClient;
};

const ctx: ApiClientContex = { client: new ApiClient() };

const ApiClientContext = createContext<ApiClientContex>(ctx);

export function ApiClientProvier({ children }: { children?: React.ReactNode }) {
  return (
    <ApiClientContext.Provider value={ctx}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient() {
  const mCtx = useContext(ApiClientContext);

  if (!mCtx) {
    throw new Error("useApiClient must be within a <ApiClientProvier />");
  }

  return mCtx;
}
