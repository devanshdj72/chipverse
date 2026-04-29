import { createContext, useContext, ReactNode } from "react";
import { useUser } from "./user";

const UserContext = createContext<ReturnType<typeof useUser> | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const value = useUser();
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
}