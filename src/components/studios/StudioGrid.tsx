import { StudioCard } from "@/components/studios/StudioCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { StudioCardSkeleton } from "@/components/ui/Skeletons";
import type { Studio } from "@/types";

const PAGE_SIZE = 9;
const SKELETON_COUNT = 9;
const MAX_VISIBLE_PAGES = 5;

interface StudioGridProps {
  studios: Studio[];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  isWishlistLoading: boolean;
  isSaved: (studioId: string) => boolean;
  isWishlistPending: (studioId: string) => boolean;
  onToggleWishlist: (studioId: string) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

function getVisiblePages(currentPage: number, pageCount: number) {
  const visibleCount = Math.min(pageCount, MAX_VISIBLE_PAGES);
  const halfWindow = Math.floor(visibleCount / 2);
  const start = Math.max(
    1,
    Math.min(currentPage - halfWindow, pageCount - visibleCount + 1),
  );

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}

export function StudioGrid({
  studios,
  total,
  page,
  isLoading,
  error,
  isWishlistLoading,
  isSaved,
  isWishlistPending,
  onToggleWishlist,
  onRetry,
  onClearFilters,
  onPageChange,
}: StudioGridProps) {
  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <section aria-label="Studio results" className="mt-8">
      <p className="mb-5 text-sm text-muted" aria-live="polite">
        Showing {isLoading ? "…" : studios.length} of{" "}
        {isLoading ? "…" : total} studios
      </p>

      {isLoading ? (
        <div
          role="status"
          aria-label="Loading studios"
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <StudioCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Studios are taking a breather"
          message={error}
          actionLabel="Try again"
          onAction={onRetry}
        />
      ) : studios.length === 0 ? (
        <EmptyState
          title="No studios match your search"
          message="Try adjusting your search or filters to discover more creative spaces."
          actionLabel="Clear filters"
          onAction={onClearFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <StudioCard
                key={studio._id}
                studio={studio}
                isWishlisted={isSaved(studio._id)}
                isWishlistPending={
                  isWishlistLoading || isWishlistPending(studio._id)
                }
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <nav
              aria-label="Studio results pages"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </button>
              {getVisiblePages(page, pageCount).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`btn btn-sm ${
                    pageNumber === page ? "btn-primary" : "btn-outline"
                  }`}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
