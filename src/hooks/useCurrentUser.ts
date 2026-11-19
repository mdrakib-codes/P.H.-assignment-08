"use client";

import { useAuthSync } from "@/components/auth/AuthSync";

export function useCurrentUser() {
  const { user, isPending } = useAuthSync();

  return { user, isPending };
}
