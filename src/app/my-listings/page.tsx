"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiCamera, FiMapPin, FiStar } from "react-icons/fi";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableRowSkeleton } from "@/components/ui/Skeletons";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { Category, Studio } from "@/types";

type StudioListing = Pick<
  Studio,
  "_id" | "title" | "category" | "hourlyRate" | "location" | "image" | "rating"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStudioCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    CATEGORIES.some((category) => category.value === value)
  );
}

function isStudioListing(value: unknown): value is StudioListing {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    isStudioCategory(value.category) &&
    typeof value.hourlyRate === "number" &&
    Number.isFinite(value.hourlyRate) &&
    typeof value.location === "string" &&
    typeof value.image === "string" &&
    typeof value.rating === "number" &&
    Number.isFinite(value.rating)
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Please try again in a moment.";
}

function getImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function StudioThumbnail({ studio }: { studio: StudioListing }) {
  const image = getImageUrl(studio.image);

  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-base-300 bg-base-300">
      {image ? (
        <div
          role="img"
          aria-label={`${studio.title} studio`}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")` }}
        />
      ) : (
        <div className="grid h-full place-items-center text-muted">
          <FiCamera aria-hidden="true" className="size-6" />
          <span className="sr-only">Studio image unavailable</span>
        </div>
      )}
    </div>
  );
}

function ListingsLoading() {
  return (
    <div aria-busy="true">
      <div className="hidden overflow-x-auto rounded-2xl border border-base-300 bg-base-200 lg:block">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Studio</th>
              <th>Category</th>
              <th>Hourly rate</th>
              <th>Location</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }, (_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:hidden" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-base-300 bg-base-200 p-5"
          >
            <div className="flex gap-4">
              <div className="size-16 shrink-0 rounded-lg bg-base-300" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 rounded bg-base-300" />
                <div className="h-4 w-1/2 rounded bg-base-300" />
                <div className="h-4 w-2/3 rounded bg-base-300" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <div className="h-10 flex-1 rounded-btn bg-base-300" />
              <div className="h-10 flex-1 rounded-btn bg-base-300" />
            </div>
          </div>
        ))}
      </div>
      <p role="status" className="sr-only">
        Loading your studio listings
      </p>
    </div>
  );
}

function StudioActions({
  studio,
  onDelete,
  disabled,
}: {
  studio: StudioListing;
  onDelete: (studio: StudioListing) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/studios/edit/${encodeURIComponent(studio._id)}`}
        className="btn btn-outline btn-sm"
      >
        Update
      </Link>
      <button
        type="button"
        className="btn btn-error btn-outline btn-sm"
        aria-label={`Delete ${studio.title}`}
        disabled={disabled}
        onClick={() => onDelete(studio)}
      >
        Delete
      </button>
    </div>
  );
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<StudioListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [studioToDelete, setStudioToDelete] = useState<StudioListing | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInFlight = useRef(false);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadListings() {
      try {
        const result = await api<unknown>("/studios/mine/list");
        if (!Array.isArray(result) || !result.every(isStudioListing)) {
          throw new Error("The studio listings response was invalid.");
        }

        if (isCurrentRequest) {
          setListings(result);
          setError(null);
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

    void loadListings();

    return () => {
      isCurrentRequest = false;
    };
  }, [reloadKey]);

  function retryLoading() {
    setError(null);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }

  async function deleteListing() {
    const selectedStudio = studioToDelete;
    if (!selectedStudio || deleteInFlight.current) {
      return;
    }

    deleteInFlight.current = true;
    setIsDeleting(true);
    try {
      await api(`/studios/${encodeURIComponent(selectedStudio._id)}`, {
        method: "DELETE",
      });
      setListings((current) =>
        current.filter((studio) => studio._id !== selectedStudio._id),
      );
      setStudioToDelete(null);
      toast.success("Studio listing deleted successfully.");
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    } finally {
      deleteInFlight.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="Your creative spaces"
        title="My Listings"
        subtitle="Manage the studios you have shared with the StudioSpace community."
        action={{ label: "Add New Studio", href: "/add-studio" }}
      />

      <section className="mx-auto w-full max-w-[1312px] px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <ListingsLoading />
        ) : error ? (
          <EmptyState
            title="We couldn't load your listings"
            message={error}
            actionLabel="Try again"
            onAction={retryLoading}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            title="You have not listed a studio yet"
            message="Add your creative space to help filmmakers, photographers, and other creators find it."
            actionLabel="Add New Studio"
            actionHref="/add-studio"
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-2xl border border-base-300 bg-base-200 lg:block">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Studio</th>
                    <th>Category</th>
                    <th>Hourly rate</th>
                    <th>Location</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((studio) => (
                    <tr key={studio._id} className="hover:bg-base-300/40">
                      <td>
                        <div className="flex min-w-56 items-center gap-3">
                          <StudioThumbnail studio={studio} />
                          <span className="font-semibold">{studio.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">
                          {studio.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap font-medium">
                        {formatCurrency(studio.hourlyRate)} / hr
                      </td>
                      <td className="max-w-64">
                        <span className="block truncate">{studio.location}</span>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1">
                          <FiStar
                            aria-hidden="true"
                            className="size-4 fill-current text-primary"
                          />
                          {studio.rating.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <StudioActions
                          studio={studio}
                          onDelete={setStudioToDelete}
                          disabled={isDeleting}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 lg:hidden">
              {listings.map((studio) => (
                <article
                  key={studio._id}
                  className="rounded-2xl border border-base-300 bg-base-200 p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <StudioThumbnail studio={studio} />
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words font-heading text-lg font-semibold">
                        {studio.title}
                      </h2>
                      <span className="badge badge-primary mt-2">
                        {studio.category}
                      </span>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-muted">Hourly rate</dt>
                      <dd className="mt-1 font-semibold">
                        {formatCurrency(studio.hourlyRate)} / hr
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Rating</dt>
                      <dd className="mt-1 inline-flex items-center gap-1 font-semibold">
                        <FiStar
                          aria-hidden="true"
                          className="size-4 fill-current text-primary"
                        />
                        {studio.rating.toFixed(1)}
                      </dd>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <dt className="text-muted">Location</dt>
                      <dd className="mt-1 flex items-start gap-2">
                        <FiMapPin
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-primary"
                        />
                        <span className="break-words">{studio.location}</span>
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-5 border-t border-base-300 pt-4">
                    <StudioActions
                      studio={studio}
                      onDelete={setStudioToDelete}
                      disabled={isDeleting}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <ConfirmModal
        open={studioToDelete !== null}
        title="Delete this listing?"
        message={
          studioToDelete
            ? `Delete "${studioToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete listing"
        danger
        loading={isDeleting}
        onConfirm={() => void deleteListing()}
        onCancel={() => setStudioToDelete(null)}
      />
    </main>
  );
}
