"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface WishlistToggleResponse {
  saved: boolean;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

export function useWishlist() {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const pendingIdsRef = useRef(new Set<string>());

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadSavedIds() {
      try {
        const result = await api<unknown>("/wishlist/ids");
        if (
          !Array.isArray(result) ||
          !result.every((id): id is string => typeof id === "string")
        ) {
          throw new Error("The wishlist response was invalid.");
        }

        if (isCurrentRequest) {
          setSavedIds(new Set(result));
        }
      } catch (error) {
        if (isCurrentRequest) {
          toast.error(`Couldn't load your wishlist. ${getErrorMessage(error)}`);
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadSavedIds();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const isSaved = useCallback(
    (studioId: string) => savedIds.has(studioId),
    [savedIds],
  );

  const isPending = useCallback(
    (studioId: string) => pendingIds.has(studioId),
    [pendingIds],
  );

  const toggle = useCallback(
    async (studioId: string) => {
      if (isLoading || pendingIdsRef.current.has(studioId)) {
        return;
      }

      const wasSaved = savedIds.has(studioId);
      const optimisticSaved = !wasSaved;
      pendingIdsRef.current.add(studioId);
      setPendingIds(new Set(pendingIdsRef.current));
      setSavedIds((currentIds) => {
        const nextIds = new Set(currentIds);
        if (optimisticSaved) {
          nextIds.add(studioId);
        } else {
          nextIds.delete(studioId);
        }
        return nextIds;
      });

      try {
        const result = await api<WishlistToggleResponse>(
          `/wishlist/${encodeURIComponent(studioId)}`,
          { method: "POST" },
        );
        if (result === null || typeof result.saved !== "boolean") {
          throw new Error("The wishlist update response was invalid.");
        }

        setSavedIds((currentIds) => {
          const nextIds = new Set(currentIds);
          if (result.saved) {
            nextIds.add(studioId);
          } else {
            nextIds.delete(studioId);
          }
          return nextIds;
        });
        toast.success(
          result.saved ? "Saved to wishlist" : "Removed from wishlist",
        );
      } catch (error) {
        setSavedIds((currentIds) => {
          const nextIds = new Set(currentIds);
          if (wasSaved) {
            nextIds.add(studioId);
          } else {
            nextIds.delete(studioId);
          }
          return nextIds;
        });
        toast.error(`Couldn't update wishlist. ${getErrorMessage(error)}`);
      } finally {
        pendingIdsRef.current.delete(studioId);
        setPendingIds(new Set(pendingIdsRef.current));
      }
    },
    [isLoading, savedIds],
  );

  return { isLoading, isPending, isSaved, toggle };
}
