"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { StudioCard } from "@/components/studios/StudioCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudioCardSkeleton } from "@/components/ui/Skeletons";
import { useWishlist } from "@/hooks/useWishlist";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { Category, Review, Studio } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReview(value: unknown): value is Review {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.role === "string" &&
    typeof value.rating === "number" &&
    Number.isFinite(value.rating) &&
    typeof value.text === "string" &&
    typeof value.createdAt === "string"
  );
}

function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    CATEGORIES.some((category) => category.value === value)
  );
}

function isStudio(value: unknown): value is Studio {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    isCategory(value.category) &&
    typeof value.hourlyRate === "number" &&
    typeof value.securityDeposit === "number" &&
    typeof value.maxCapacity === "number" &&
    typeof value.location === "string" &&
    typeof value.image === "string" &&
    Array.isArray(value.gallery) &&
    value.gallery.every((item) => typeof item === "string") &&
    Array.isArray(value.amenities) &&
    value.amenities.every((item) => typeof item === "string") &&
    typeof value.overview === "string" &&
    typeof value.ownerEmail === "string" &&
    typeof value.ownerName === "string" &&
    typeof value.rating === "number" &&
    Number.isFinite(value.rating) &&
    Array.isArray(value.reviews) &&
    value.reviews.every(isReview) &&
    typeof value.createdAt === "string"
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Please try again in a moment.";
}

function WishlistSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading wishlist"
      className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <StudioCardSkeleton key={index} />
      ))}
      <span className="sr-only">Loading your wishlist</span>
    </div>
  );
}

export default function WishlistPage() {
  const {
    isLoading: isWishlistLoading,
    isAuthPending,
    isAuthenticated,
    ensureReady,
    refresh,
    isPending,
    isSaved,
    toggle,
  } = useWishlist();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const showLoginNotice = !isAuthPending && !isAuthenticated;

  useEffect(() => {
    let isCurrentRequest = true;

    if (isAuthPending || !isAuthenticated) {
      return;
    }

    async function loadWishlist() {
      try {
        const ready = await ensureReady();
        if (!ready) {
          throw new Error("We couldn't verify your session. Please try again.");
        }

        const result = await api<unknown>("/wishlist");
        if (!Array.isArray(result) || !result.every(isStudio)) {
          throw new Error("The wishlist response was invalid.");
        }
        if (isCurrentRequest) {
          setStudios(result);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadWishlist();
    return () => {
      isCurrentRequest = false;
    };
  }, [ensureReady, isAuthPending, isAuthenticated, retryCount]);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    refresh();
    setRetryCount((count) => count + 1);
  }, [refresh]);

  async function removeStudio(studioId: string) {
    if (removingId !== null) {
      return;
    }

    setRemovingId(studioId);
    try {
      const saved = await toggle(studioId);
      if (saved === false) {
        setStudios((current) =>
          current.filter((studio) => studio._id !== studioId),
        );
      }
    } catch (removeError) {
      toast.error(getErrorMessage(removeError));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="Your saved spaces"
        title="Wishlist"
        subtitle="Keep your favorite creative spaces close and revisit them whenever inspiration strikes."
      />

      <section className="mx-auto w-full max-w-[1312px] px-4 sm:px-6 lg:px-8">
        {isLoading || isWishlistLoading ? (
          <WishlistSkeleton />
        ) : showLoginNotice ? (
          <EmptyState
            title="Log in to see your wishlist"
            message="Sign in to save and revisit your favorite studios."
            actionLabel="Login"
            actionHref="/login"
          />
        ) : error ? (
          <EmptyState
            title="We couldn't load your wishlist"
            message={error}
            actionLabel="Try again"
            onAction={retry}
          />
        ) : studios.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            message="Save studios that catch your eye and they will be gathered here."
            actionLabel="Explore Studios"
            actionHref="/studios"
          />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => {
              const isRemoving = removingId === studio._id;
              return (
                <StudioCard
                  key={studio._id}
                  studio={studio}
                  isWishlisted={
                    isPending(studio._id) ? isSaved(studio._id) : true
                  }
                  isWishlistPending={isRemoving || isPending(studio._id)}
                  onToggleWishlist={(id) => void removeStudio(id)}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
