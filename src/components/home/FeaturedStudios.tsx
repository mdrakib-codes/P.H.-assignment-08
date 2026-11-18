"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudioCard } from "@/components/studios/StudioCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudioCardSkeleton } from "@/components/ui/Skeletons";
import { useWishlist } from "@/hooks/useWishlist";
import { api } from "@/lib/api";
import type { Studio } from "@/types";

const FEATURED_STUDIO_COUNT = 6;

export function FeaturedStudios() {
  const {
    isLoading: isWishlistLoading,
    isPending,
    isSaved,
    toggle,
  } = useWishlist();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadStudios() {
      setIsLoading(true);
      setHasError(false);

      try {
        const result = await api<Studio[]>("/studios/featured");

        if (result !== null && !Array.isArray(result)) {
          throw new Error("The featured studios response was not a list.");
        }

        if (isCurrentRequest) {
          setStudios((result ?? []).slice(0, FEATURED_STUDIO_COUNT));
        }
      } catch {
        if (isCurrentRequest) {
          setStudios([]);
          setHasError(true);
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadStudios();

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  function retry() {
    setRetryCount((currentCount) => currentCount + 1);
  }

  return (
    <section
      id="featured-studios"
      aria-labelledby="featured-studios-heading"
      className="mx-auto max-w-[1312px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mb-9 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Made for your next idea
          </p>
          <h2
            id="featured-studios-heading"
            className="mt-3 font-heading text-3xl font-semibold leading-[1.15] sm:text-[40px]"
          >
            Find your next favorite space
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Explore distinctive studios, thoughtfully equipped for the work you
            want to make.
          </p>
        </div>
        <Link href="/studios" className="btn btn-outline w-full shrink-0 md:w-auto">
          View all studios
        </Link>
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading featured studios"
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: FEATURED_STUDIO_COUNT }, (_, index) => (
            <StudioCardSkeleton key={index} />
          ))}
        </div>
      ) : hasError ? (
        <EmptyState
          title="Featured studios are taking a breather"
          message="We couldn't load the spaces right now. Please try again in a moment."
          actionLabel="Try again"
          onAction={retry}
        />
      ) : studios.length === 0 ? (
        <EmptyState
          title="No studios to feature just yet"
          message="New creative spaces are on the way. Explore all studios to find the right fit for your next project."
          actionLabel="Explore studios"
          actionHref="/studios"
        />
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <StudioCard
              key={studio._id}
              studio={studio}
              isWishlisted={isSaved(studio._id)}
              isWishlistPending={
                isWishlistLoading || isPending(studio._id)
              }
              onToggleWishlist={toggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
