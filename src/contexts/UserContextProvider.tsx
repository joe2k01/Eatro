import React, { createContext, useContext, useEffect } from "react";
import { z } from "zod";
import { useStorage } from "../hooks/useStorage";

const userSchema = z
  .object({
    name: z.string(),
  })
  .partial();

type TUserContext = z.infer<typeof userSchema>;

const UserContext = createContext<TUserContext>({});

type UserContextProviderProps = {
  children?: React.ReactNode;
};

export function UserContextProvider({ children }: UserContextProviderProps) {
  const { data: user, storageApi } = useStorage("user", userSchema);

  useEffect(() => {
    storageApi.current?.load();
  }, [storageApi]);

  console.log(user);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);

  if (!ctx) {
    throw new Error("useUser must be wrapped in a <UserContextProvider />");
  }

  return ctx;
}
