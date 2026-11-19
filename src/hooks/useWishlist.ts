"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useAuthSync } from "@/components/auth/AuthSync";
import { ApiError, api } from "@/lib/api";

interface WishlistToggleResponse {
  saved: boolean;
}

interface WishlistContextValue {
  isLoading: boolean;
  isAuthPending: boolean;
  isAuthenticated: boolean;
  ensureReady: () => Promise<boolean>;
  refresh: () => void;
  isPending: (studioId: string) => boolean;
  isSaved: (studioId: string) => boolean;
  toggle: (studioId: string) => Promise<boolean | null>;
}

interface LoadedWishlist {
  userId: string | null;
  token: number;
  ids: Set<string>;
  status: "idle" | "ready" | "error";
}

interface PendingWishlist {
  userId: string | null;
  ids: Set<string>;
}

const EMPTY_IDS = new Set<string>();
export const WishlistContext = createContext<WishlistContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

function isStringIdArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string");
}

export function useWishlistController(): WishlistContextValue {
  const {
    userId: currentUserId,
    isPending: isAuthPending,
    ensureJwt,
    refreshJwt,
  } = useAuthSync();
  const router = useRouter();

  const [loadedState, setLoadedState] = useState<LoadedWishlist>(() => ({
    userId: null,
    token: -1,
    ids: EMPTY_IDS,
    status: "idle",
  }));
  const [pendingState, setPendingState] = useState<PendingWishlist>(() => ({
    userId: null,
    ids: EMPTY_IDS,
  }));
  const [reloadToken, setReloadToken] = useState(0);

  const isCurrentLoaded =
    loadedState.userId === currentUserId &&
    loadedState.token === reloadToken &&
    loadedState.status !== "idle";
  const savedIds = isCurrentLoaded ? loadedState.ids : EMPTY_IDS;
  const pendingIds = pendingState.userId === currentUserId ? pendingState.ids : EMPTY_IDS;
  const isLoading = isAuthPending || (currentUserId !== null && !isCurrentLoaded);

  const savedIdsRef = useRef(savedIds);
  const pendingIdsRef = useRef(pendingIds);

  useEffect(() => {
    savedIdsRef.current = savedIds;
  }, [savedIds]);

  useEffect(() => {
    pendingIdsRef.current = pendingIds;
  }, [pendingIds]);

  const ensureReady = useCallback(async () => {
    if (isAuthPending || !currentUserId) {
      return false;
    }

    return ensureJwt();
  }, [ensureJwt, isAuthPending, currentUserId]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    if (isAuthPending || !currentUserId || isCurrentLoaded) {
      return;
    }

    async function loadSavedIds() {
      try {
        const ready = await ensureReady();
        if (!ready) {
          const retried = await refreshJwt();
          if (!retried) {
            throw new Error("We couldn't verify your session. Please try again.");
          }
        }

        const result = await api<unknown>("/wishlist/ids");
        if (!isStringIdArray(result)) {
          throw new Error("The wishlist response was invalid.");
        }

        if (!isCurrentRequest) {
          return;
        }

        setLoadedState({
          userId: currentUserId,
          token: reloadToken,
          ids: new Set(result),
          status: "ready",
        });
      } catch (error) {
        if (!isCurrentRequest) {
          return;
        }

        setLoadedState({
          userId: currentUserId,
          token: reloadToken,
          ids: EMPTY_IDS,
          status: "error",
        });
        toast.error(`Couldn't load your wishlist. ${getErrorMessage(error)}`);
      }
    }

    void loadSavedIds();

    return () => {
      isCurrentRequest = false;
    };
  }, [isAuthPending, currentUserId, ensureReady, refreshJwt, isCurrentLoaded, reloadToken]);

  const isSaved = useCallback(
    (studioId: string) => savedIds.has(studioId),
    [savedIds],
  );

  const isPending = useCallback(
    (studioId: string) => pendingIds.has(studioId),
    [pendingIds],
  );

  const toggle = useCallback(
    async (studioId: string): Promise<boolean | null> => {
      if (isAuthPending) {
        return null;
      }

      if (!currentUserId) {
        toast.info("Log in to save studios to your wishlist.");
        const redirect =
          typeof window === "undefined"
            ? "/"
            : `${window.location.pathname}${window.location.search}`;
        router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
        return null;
      }

      if (isLoading || pendingIdsRef.current.has(studioId)) {
        return null;
      }

      const wasSaved = savedIdsRef.current.has(studioId);
      const optimisticSaved = !wasSaved;
      const pendingWithStudio = new Set(pendingIdsRef.current);
      pendingWithStudio.add(studioId);
      pendingIdsRef.current = pendingWithStudio;
      setPendingState({ userId: currentUserId, ids: pendingWithStudio });
      setLoadedState((current) => {
        const base =
          current.userId === currentUserId && current.token === reloadToken
            ? current.ids
            : EMPTY_IDS;
        const nextIds = new Set(base);
        if (optimisticSaved) {
          nextIds.add(studioId);
        } else {
          nextIds.delete(studioId);
        }
        savedIdsRef.current = nextIds;
        return {
          userId: currentUserId,
          token: reloadToken,
          ids: nextIds,
          status: "ready",
        };
      });

      async function postToggle() {
        return api<WishlistToggleResponse>(
          `/wishlist/${encodeURIComponent(studioId)}`,
          { method: "POST" },
        );
      }

      try {
        const ready = await ensureReady();
        if (!ready) {
          throw new Error("We couldn't verify your session. Please try again.");
        }

        let result: WishlistToggleResponse | null;
        try {
          result = await postToggle();
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 401) {
            throw error;
          }

          const retried = await refreshJwt();
          if (!retried) {
            throw error;
          }
          result = await postToggle();
        }

        if (result === null || typeof result.saved !== "boolean") {
          throw new Error("The wishlist update response was invalid.");
        }

        const saved = result.saved;
        setLoadedState((current) => {
          const base =
            current.userId === currentUserId && current.token === reloadToken
              ? current.ids
              : EMPTY_IDS;
          const nextIds = new Set(base);
          if (saved) {
            nextIds.add(studioId);
          } else {
            nextIds.delete(studioId);
          }
          savedIdsRef.current = nextIds;
          return {
            userId: currentUserId,
            token: reloadToken,
            ids: nextIds,
            status: "ready",
          };
        });
        toast.success(saved ? "Saved to wishlist" : "Removed from wishlist");
        return saved;
      } catch (error) {
        setLoadedState((current) => {
          const base =
            current.userId === currentUserId && current.token === reloadToken
              ? current.ids
              : EMPTY_IDS;
          const nextIds = new Set(base);
          if (wasSaved) {
            nextIds.add(studioId);
          } else {
            nextIds.delete(studioId);
          }
          savedIdsRef.current = nextIds;
          return {
            userId: currentUserId,
            token: reloadToken,
            ids: nextIds,
            status: "ready",
          };
        });
        toast.error(`Couldn't update wishlist. ${getErrorMessage(error)}`);
        return null;
      } finally {
        const pendingWithoutStudio = new Set(pendingIdsRef.current);
        pendingWithoutStudio.delete(studioId);
        pendingIdsRef.current = pendingWithoutStudio;
        setPendingState({ userId: currentUserId, ids: pendingWithoutStudio });
      }
    },
    [
      isAuthPending,
      refreshJwt,
      currentUserId,
      ensureReady,
      isLoading,
      reloadToken,
      router,
    ],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      isLoading,
      isAuthPending: isAuthPending,
      isAuthenticated: Boolean(currentUserId),
      ensureReady,
      refresh,
      isPending,
      isSaved,
      toggle,
    }),
    [
      isAuthPending,
      currentUserId,
      ensureReady,
      isLoading,
      isPending,
      isSaved,
      refresh,
      toggle,
    ],
  );

  return value;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
