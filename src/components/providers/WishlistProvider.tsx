"use client";

import type { ReactNode } from "react";
import {
  WishlistContext,
  useWishlistController,
} from "@/hooks/useWishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const value = useWishlistController();

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export default WishlistProvider;
