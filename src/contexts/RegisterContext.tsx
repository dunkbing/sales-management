"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type RegisterSession = {
  id: number;
  storeId: number;
  openedByUserId: number;
  openingFloat: string;
  openedAt: Date;
};

type RegisterContextType = {
  session: RegisterSession | null;
  setSession: (session: RegisterSession | null) => void;
  storeId: number;
  setStoreId: (storeId: number) => void;
};

const RegisterContext = createContext<RegisterContextType | undefined>(
  undefined,
);

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<RegisterSession | null>(null);
  const [storeId, setStoreId] = useState(1); // Default store, can be changed

  return (
    <RegisterContext.Provider
      value={{ session, setSession, storeId, setStoreId }}
    >
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error("useRegister must be used within a RegisterProvider");
  }
  return context;
}
