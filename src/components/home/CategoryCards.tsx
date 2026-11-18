"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCamera,
  FiFilm,
  FiMic,
  FiMusic,
  FiTool,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api";
import type { Category } from "@/types";

interface CategoryCount {
  category: Category;
  count: number;
}

const CATEGORY_ICONS: Record<Category, IconType> = {
  "Photo Studio": FiCamera,
  "Film Stage": FiFilm,
  "Podcast Lounge": FiMic,
  "Music Suite": FiMusic,
  Workshop: FiTool,
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  "Photo Studio": "Portrait, product and editorial studios ready for your next shoot.",
  "Film Stage": "Production stages made for filming, sets and moving-image work.",
  "Podcast Lounge": "Acoustically considered rooms for podcasts and conversation.",
  "Music Suite": "Tuned spaces for rehearsing, recording and making your next track.",
  Workshop: "Practical studios for hands-on craft, making and collaboration.",
};

function isCategory(value: unknown): value is Category {
  return CATEGORIES.some(({ value: category }) => category === value);
}

function parseCategoryCounts(
  response: unknown,
): CategoryCount[] {
  if (!Array.isArray(response)) {
    throw new Error("The category counts response was not a list.");
  }

  const counts: CategoryCount[] = [];

  for (const item of response) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("category" in item) ||
      !("count" in item)
    ) {
      throw new Error("A category count was invalid.");
    }

    const category = item.category;
    const count = item.count;

    if (
      !isCategory(category) ||
      typeof count !== "number" ||
      !Number.isSafeInteger(count) ||
      count < 0
    ) {
      throw new Error("A category count was invalid.");
    }

    counts.push({ category, count });
  }

  return counts;
}

export function CategoryCards() {
  const [counts, setCounts] = useState<Partial<Record<Category, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadCounts() {
      setIsLoading(true);
      setHasError(false);

      try {
        const result = await api<unknown>("/studios/stats/categories");
        const categoryCounts = result === null ? [] : parseCategoryCounts(result);
        const nextCounts: Partial<Record<Category, number>> = {};

        for (const { category, count } of categoryCounts) {
          nextCounts[category] = count;
        }

        if (isCurrentRequest) {
          setCounts(nextCounts);
        }
      } catch {
        if (isCurrentRequest) {
          setHasError(true);
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadCounts();

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  return (
    <section
      aria-labelledby="studio-categories-heading"
      className="border-y border-base-300 bg-base-200"
    >
      <div className="mx-auto max-w-[1312px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Find your kind of space
          </p>
          <h2
            id="studio-categories-heading"
            className="mt-3 font-heading text-3xl font-semibold leading-[1.15] sm:text-[40px]"
          >
            Explore by category
          </h2>
          <p className="mt-4 leading-7 text-muted">
            From a quiet recording room to a full production stage, start with
            the kind of space your project needs.
          </p>
        </div>

        {hasError && (
          <div
            role="alert"
            className="alert alert-error mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>Live category counts are temporarily unavailable.</span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setRetryCount((currentCount) => currentCount + 1)}
            >
              Retry counts
            </button>
          </div>
        )}

        <div className="mt-9 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.value];
            const count = counts[category.value];

            return (
              <Link
                key={category.value}
                href={`/studios?category=${encodeURIComponent(category.value)}`}
                className="group flex h-full min-h-60 flex-col rounded-2xl border border-base-300 bg-base-100 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={`Explore ${category.label}`}
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-content">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold">
                  {category.label}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {CATEGORY_DESCRIPTIONS[category.value]}
                </p>
                <p
                  className="mt-5 text-sm font-medium text-base-content/80"
                  aria-live="polite"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 text-muted">
                      <span
                        aria-hidden="true"
                        className="size-3 animate-pulse rounded-full bg-base-300"
                      />
                      Loading count
                    </span>
                  ) : hasError ? (
                    "Count unavailable"
                  ) : (
                    `${count ?? 0} ${count === 1 ? "space" : "spaces"}`
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
