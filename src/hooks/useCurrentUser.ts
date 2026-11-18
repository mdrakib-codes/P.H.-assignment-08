"use client";

import { DEV_USER } from "@/lib/devUser";

export function useCurrentUser() {
  // TODO: Replace this development user with the Better Auth session later.
  return {
    user: DEV_USER,
    isPending: false,
  };
}
