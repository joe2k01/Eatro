import { useStorage } from "@hooks/useStorage";
import type { User } from "@constants/storage/validators";
import React, { createContext, useContext } from "react";

type TUserContext = User;

const UserContext = createContext<TUserContext>({});

type UserContextProviderProps = {
  children?: React.ReactNode;
};

export function UserContextProvider({ children }: UserContextProviderProps) {
  const { data: user } = useStorage("user", {});

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be wrapped in a <UserContextProvider />");
  }

  return ctx;
}
