"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterBar, type PriceFilter, type StudioSort } from "@/components/studios/FilterBar";
import { StudioGrid } from "@/components/studios/StudioGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useWishlist } from "@/hooks/useWishlist";
import { CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api";
import type { Category, Studio } from "@/types";

const PAGE_SIZE = 9;
const PRICE_FILTERS: readonly PriceFilter[] = [
  "any",
  "under-30",
  "30-60",
  "over-60",
];
const SORT_OPTIONS: readonly StudioSort[] = [
  "newest",
  "price_asc",
  "price_desc",
  "rating",
];

interface StudioListResponse {
  studios: Studio[];
  total: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isReview(value: unknown) {
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

function isStudio(value: unknown): value is Studio {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.category === "string" &&
    isCategory(value.category) &&
    typeof value.hourlyRate === "number" &&
    typeof value.securityDeposit === "number" &&
    typeof value.maxCapacity === "number" &&
    typeof value.location === "string" &&
    typeof value.image === "string" &&
    isStringArray(value.gallery) &&
    isStringArray(value.amenities) &&
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

function isStudioListResponse(value: unknown): value is StudioListResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.studios) &&
    value.studios.every(isStudio) &&
    typeof value.total === "number" &&
    Number.isSafeInteger(value.total) &&
    value.total >= 0
  );
}

function isCategory(value: string | null): value is Category {
  return CATEGORIES.some((category) => category.value === value);
}

function isPriceFilter(value: string | null): value is PriceFilter {
  return value !== null && PRICE_FILTERS.some((filter) => filter === value);
}

function isStudioSort(value: string | null): value is StudioSort {
  return value !== null && SORT_OPTIONS.some((option) => option === value);
}

function parsePage(value: string | null) {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

function ExploreStudiosContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading: isWishlistLoading, isPending, isSaved, toggle } =
    useWishlist();
  const [response, setResponse] = useState<StudioListResponse>({
    studios: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const categoryValue = searchParams.get("category");
  const category = isCategory(categoryValue) ? categoryValue : "";
  const search = searchParams.get("search") ?? "";
  const priceValue = searchParams.get("price");
  const price = isPriceFilter(priceValue) ? priceValue : "any";
  const sortValue = searchParams.get("sort");
  const sort = isStudioSort(sortValue) ? sortValue : "newest";
  const page = parsePage(searchParams.get("page"));

  const requestQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search.trim()) params.set("search", search.trim());
    if (price === "under-30") params.set("maxPrice", "29.99");
    if (price === "30-60") {
      params.set("minPrice", "30");
      params.set("maxPrice", "60");
    }
    if (price === "over-60") params.set("minPrice", "60.01");
    if (sort !== "newest") params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    return params.toString();
  }, [category, page, price, search, sort]);

  const updateQuery = useCallback(
    (
      updates: Record<string, string | null>,
      history: "push" | "replace" = "push",
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      if (href === `${pathname}${searchParams.size ? `?${searchParams}` : ""}`) {
        return;
      }

      if (history === "replace") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      updateQuery({ [key]: value, page: null });
    },
    [updateQuery],
  );

  const clearFilters = useCallback(() => {
    const currentQuery = searchParams.toString();
    if (currentQuery) {
      router.push(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadStudios() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api<unknown>(`/studios?${requestQuery}`);
        if (!isStudioListResponse(result)) {
          throw new Error("The studios response was invalid.");
        }

        if (isCurrentRequest) {
          setResponse(result);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setResponse({ studios: [], total: 0 });
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Please try again in a moment.",
          );
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
  }, [requestQuery, retryCount]);

  useEffect(() => {
    if (isLoading || error) {
      return;
    }

    const lastPage = Math.max(1, Math.ceil(response.total / PAGE_SIZE));
    if (page > lastPage) {
      updateQuery(
        { page: lastPage === 1 ? null : String(lastPage) },
        "replace",
      );
    }
  }, [error, isLoading, page, response.total, updateQuery]);

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="Find your next creative space"
        title="Explore Studios"
        subtitle="Search and compare photography studios, production stages, podcast rooms and more to find the right space for your next project."
      />
      <div className="mx-auto max-w-[1312px] px-4 sm:px-6 lg:px-8">
        <FilterBar
          search={search}
          category={category}
          price={price}
          sort={sort}
          onSearchChange={(value) =>
            updateFilter("search", value || null)
          }
          onCategoryChange={(value) =>
            updateFilter("category", value || null)
          }
          onPriceChange={(value) =>
            updateFilter("price", value === "any" ? null : value)
          }
          onSortChange={(value) =>
            updateFilter("sort", value === "newest" ? null : value)
          }
        />
        <StudioGrid
          studios={response.studios}
          total={response.total}
          page={page}
          isLoading={isLoading}
          error={error}
          isWishlistLoading={isWishlistLoading}
          isSaved={isSaved}
          isWishlistPending={isPending}
          onToggleWishlist={toggle}
          onRetry={() => setRetryCount((count) => count + 1)}
          onClearFilters={clearFilters}
          onPageChange={(nextPage) =>
            updateQuery({ page: nextPage === 1 ? null : String(nextPage) })
          }
        />
      </div>
    </main>
  );
}

export default function ExploreStudiosPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-[50vh] place-items-center bg-base-100">
          <Spinner label="Loading studios" />
        </main>
      }
    >
      <ExploreStudiosContent />
    </Suspense>
  );
}
