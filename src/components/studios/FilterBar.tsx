"use client";

import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/types";

export type PriceFilter = "any" | "under-30" | "30-60" | "over-60";
export type StudioSort = "newest" | "price_asc" | "price_desc" | "rating";

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

function isCategory(value: string): value is Category {
  return CATEGORIES.some((item) => item.value === value);
}

function isPriceFilter(value: string): value is PriceFilter {
  return PRICE_FILTERS.some((filter) => filter === value);
}

function isStudioSort(value: string): value is StudioSort {
  return SORT_OPTIONS.some((option) => option === value);
}

interface FilterBarProps {
  search: string;
  category: Category | "";
  price: PriceFilter;
  sort: StudioSort;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: Category | "") => void;
  onPriceChange: (value: PriceFilter) => void;
  onSortChange: (value: StudioSort) => void;
}

export function FilterBar({
  search,
  category,
  price,
  sort,
  onSearchChange,
  onCategoryChange,
  onPriceChange,
  onSortChange,
}: FilterBarProps) {
  const [draftSearch, setDraftSearch] = useState(search);
  const previousSearch = useRef(search);
  const submittedSearch = useRef<string | null>(null);

  useEffect(() => {
    if (previousSearch.current === search) {
      return;
    }

    previousSearch.current = search;
    if (submittedSearch.current === search) {
      submittedSearch.current = null;
      return;
    }

    submittedSearch.current = null;
    setDraftSearch(search);
  }, [search]);

  useEffect(() => {
    const normalizedSearch = draftSearch.trim();
    if (normalizedSearch === search) {
      return;
    }

    const timeout = window.setTimeout(() => {
      submittedSearch.current = normalizedSearch;
      onSearchChange(normalizedSearch);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [draftSearch, onSearchChange, search]);

  return (
    <section
      aria-label="Filter studios"
      className="rounded-2xl border border-base-300 bg-base-200 p-4 sm:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(14rem,1.5fr)_repeat(3,minmax(10rem,1fr))]">
        <label className="form-control">
          <span className="label-text mb-2 font-medium">Search</span>
          <span className="input input-bordered flex w-full items-center gap-2 bg-base-100">
            <FiSearch aria-hidden="true" className="size-4 shrink-0 text-muted" />
            <input
              type="search"
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search by studio or location"
              className="grow bg-transparent outline-none"
              aria-label="Search studios by name or location"
            />
          </span>
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Category</span>
          <select
            className="select select-bordered w-full bg-base-100"
            value={category}
            onChange={(event) => {
              const value = event.target.value;
              onCategoryChange(isCategory(value) ? value : "");
            }}
          >
            <option value="">All categories</option>
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Price range</span>
          <select
            className="select select-bordered w-full bg-base-100"
            value={price}
            onChange={(event) => {
              const value = event.target.value;
              onPriceChange(isPriceFilter(value) ? value : "any");
            }}
          >
            <option value="any">Any price</option>
            <option value="under-30">Under $30</option>
            <option value="30-60">$30 to $60</option>
            <option value="over-60">Above $60</option>
          </select>
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Sort by</span>
          <select
            className="select select-bordered w-full bg-base-100"
            value={sort}
            onChange={(event) => {
              const value = event.target.value;
              onSortChange(isStudioSort(value) ? value : "newest");
            }}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-medium">Browse by category</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${
              category === "" ? "btn-primary" : "btn-outline"
            }`}
            aria-pressed={category === ""}
            onClick={() => onCategoryChange("")}
          >
            All spaces
          </button>
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm ${
                category === value ? "btn-primary" : "btn-outline"
              }`}
              aria-pressed={category === value}
              onClick={() => onCategoryChange(category === value ? "" : value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
