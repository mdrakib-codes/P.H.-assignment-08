"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { User } from "@/types";

const PrivateUserContext = createContext<User | null>(null);

export function usePrivateUser(): User {
  const user = useContext(PrivateUserContext);

  if (!user) {
    throw new Error("usePrivateUser must be used inside PrivateRouteGuard");
  }

  return user;
}

export function PrivateRouteGuard({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending || user) {
      return;
    }

    const search = typeof window === "undefined" ? "" : window.location.search;
    const redirect = `${pathname}${search}`;

    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
  }, [isPending, pathname, router, user]);

  if (isPending || !user) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-base-100 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size={56} label="Checking your session" />
          <p className="text-sm text-muted">
            {isPending ? "Checking your session..." : "Redirecting to login..."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <PrivateUserContext.Provider value={user}>
      {children}
    </PrivateUserContext.Provider>
  );
}
