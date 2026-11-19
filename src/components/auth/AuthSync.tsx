"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/types";

type JwtStatus = "idle" | "syncing" | "ready" | "error";

interface AuthSyncContextValue {
  user: User | null;
  userId: string | null;
  isPending: boolean;
  jwtStatus: JwtStatus;
  ensureJwt: () => Promise<boolean>;
  refreshJwt: () => Promise<boolean>;
}

const AuthSyncContext = createContext<AuthSyncContextValue | null>(null);

export function AuthSyncProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const [jwtStatus, setJwtStatus] = useState<JwtStatus>("idle");
  const jwtStatusRef = useRef<JwtStatus>("idle");
  const jwtUserIdRef = useRef<string | null>(null);
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const jwtPromiseRef = useRef<Promise<boolean> | null>(null);
  const generationRef = useRef(0);

  const user = useMemo<User | null>(() => {
    const sessionUser = session?.user;
    if (!sessionUser) {
      return null;
    }

    return {
      name: sessionUser.name || "",
      email: sessionUser.email || "",
      image: sessionUser.image || "",
    };
  }, [session?.user]);

  const updateJwtStatus = useCallback((status: JwtStatus) => {
    jwtStatusRef.current = status;
    setJwtStatus(status);
  }, []);

  const ensureJwt = useCallback(
    async (force = false) => {
      if (!userId) {
        return false;
      }

      if (
        !force &&
        jwtUserIdRef.current === userId &&
        jwtStatusRef.current === "ready"
      ) {
        return true;
      }

      if (jwtPromiseRef.current) {
        return jwtPromiseRef.current;
      }

      const generation = generationRef.current;
      updateJwtStatus("syncing");

      const promise = (async () => {
        try {
          const response = await fetch("/api/jwt", {
            method: "POST",
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error("Failed to sync JWT");
          }

          if (generation !== generationRef.current) {
            return false;
          }

          jwtUserIdRef.current = userId;
          lastSyncedUserIdRef.current = userId;
          updateJwtStatus("ready");
          return true;
        } catch {
          if (generation === generationRef.current) {
            updateJwtStatus("error");
          }
          return false;
        } finally {
          jwtPromiseRef.current = null;
        }
      })();

      jwtPromiseRef.current = promise;
      return promise;
    },
    [updateJwtStatus, userId],
  );

  const refreshJwt = useCallback(() => ensureJwt(true), [ensureJwt]);

  useEffect(() => {
    generationRef.current += 1;
    jwtUserIdRef.current = null;
    jwtPromiseRef.current = null;
  }, [userId]);

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!userId) {
      if (lastSyncedUserIdRef.current) {
        lastSyncedUserIdRef.current = null;
        void fetch("/api/jwt", {
          method: "DELETE",
          credentials: "include",
        }).catch(() => {});
      }
      return;
    }

    void ensureJwt();
  }, [ensureJwt, isPending, userId]);

  const value = useMemo<AuthSyncContextValue>(
    () => ({ user, userId, isPending, jwtStatus, ensureJwt, refreshJwt }),
    [ensureJwt, isPending, jwtStatus, refreshJwt, user, userId],
  );

  return (
    <AuthSyncContext.Provider value={value}>
      {children}
    </AuthSyncContext.Provider>
  );
}

export function useAuthSync(): AuthSyncContextValue {
  const context = useContext(AuthSyncContext);
  if (!context) {
    throw new Error("useAuthSync must be used inside AuthSyncProvider");
  }

  return context;
}

export default AuthSyncProvider;
