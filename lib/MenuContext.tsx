"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface MenuContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <MenuContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}