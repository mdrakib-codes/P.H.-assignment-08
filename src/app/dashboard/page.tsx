"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FiCalendar,
  FiDollarSign,
  FiHome,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { toast } from "sonner";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import type { Booking, BookingStatus } from "@/types";

type StudioSummary = Pick<Booking, "studioId" | "studioTitle" | "studioImage"> & {
  location: string;
};

interface StatusResponse {
  message: string;
  booking: Booking;
}

const VALID_STATUSES: readonly BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBooking(value: unknown): value is Booking {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.studioId === "string" &&
    typeof value.studioTitle === "string" &&
    typeof value.studioImage === "string" &&
    typeof value.hostEmail === "string" &&
    typeof value.userEmail === "string" &&
    typeof value.userName === "string" &&
    typeof value.date === "string" &&
    typeof value.startTime === "string" &&
    typeof value.endTime === "string" &&
    typeof value.notes === "string" &&
    typeof value.hours === "number" &&
    Number.isFinite(value.hours) &&
    typeof value.totalPrice === "number" &&
    Number.isFinite(value.totalPrice) &&
    typeof value.status === "string" &&
    VALID_STATUSES.some((status) => status === value.status) &&
    typeof value.createdAt === "string"
  );
}

function isStatusResponse(value: unknown): value is StatusResponse {
  return (
    isRecord(value) &&
    typeof value.message === "string" &&
    isBooking(value.booking)
  );
}

function isStudio(
  value: unknown,
): value is Record<string, unknown> & {
  _id: string;
  title: string;
  image: string;
  location: string;
} {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.image === "string" &&
    typeof value.location === "string"
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Please try again in a moment.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading host dashboard" className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="h-28 animate-pulse rounded-2xl border border-base-300 bg-base-200"
          />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="h-52 animate-pulse rounded-2xl border border-base-300 bg-base-200"
          />
        ))}
      </div>
      <span className="sr-only">Loading host dashboard</span>
    </div>
  );
}

function DashboardRequestCard({
  booking,
  studio,
  busy,
  onChangeStatus,
}: {
  booking: Booking;
  studio?: StudioSummary;
  busy: boolean;
  onChangeStatus: (booking: Booking, status: BookingStatus) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const actions =
    booking.status === "Pending"
      ? [
          { label: "Confirm", status: "Confirmed" as const, style: "btn-primary" },
          { label: "Decline", status: "Cancelled" as const, style: "btn-outline btn-error" },
        ]
      : booking.status === "Confirmed"
        ? [
            { label: "Mark Completed", status: "Completed" as const, style: "btn-primary" },
            { label: "Cancel", status: "Cancelled" as const, style: "btn-outline btn-error" },
          ]
        : [];

  return (
    <article className="grid gap-5 rounded-2xl border border-base-300 bg-base-200 p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-base-300 sm:w-36">
          {booking.studioImage && !imageFailed ? (
            <Image
              src={booking.studioImage}
              alt={`${booking.studioTitle} studio`}
              fill
              sizes="(max-width: 639px) 100vw, 144px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="grid h-full place-items-center text-muted">
              <FiHome aria-hidden="true" className="size-8" />
              <span className="sr-only">Studio image unavailable</span>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words font-heading text-lg font-semibold">
                {booking.studioTitle}
              </h2>
              {studio?.location && (
                <p className="mt-1 break-words text-sm text-muted">
                  {studio.location}
                </p>
              )}
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
            <p className="flex items-start gap-2">
              <FiUser aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block font-medium">{booking.userName}</span>
                <span className="block break-all text-muted">{booking.userEmail}</span>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <FiCalendar aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <span>{formatDate(booking.date)} · {booking.startTime}–{booking.endTime}</span>
            </p>
            <p className="flex items-center gap-2 font-semibold">
              <FiDollarSign aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <span>{formatCurrency(booking.totalPrice)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:max-w-44 lg:flex-col">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            className={`btn btn-sm ${action.style}`}
            disabled={busy}
            onClick={() => onChangeStatus(booking, action.status)}
          >
            {busy && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [listings, setListings] = useState<StudioSummary[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
  const [retryCount, setRetryCount] = useState(0);
  const busyIdsRef = useRef(new Set<string>());

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const [listingResult, bookingResult] = await Promise.all([
          api<unknown>("/studios/mine/list"),
          api<unknown>("/bookings/host"),
        ]);
        if (
          !Array.isArray(listingResult) ||
          !listingResult.every(isStudio) ||
          !Array.isArray(bookingResult) ||
          !bookingResult.every(isBooking)
        ) {
          throw new Error("The dashboard response was invalid.");
        }

        if (isCurrentRequest) {
          setListings(
            listingResult.map((studio) => ({
              studioId: studio._id,
              studioTitle: studio.title,
              studioImage: studio.image,
              location: studio.location,
            })),
          );
          setBookings(bookingResult);
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

    void loadDashboard();
    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  const studiosById = useMemo(
    () => new Map(listings.map((studio) => [studio.studioId, studio])),
    [listings],
  );
  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === "Pending").length,
    [bookings],
  );
  const confirmedEarnings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === "Confirmed")
        .reduce((total, booking) => total + booking.totalPrice, 0),
    [bookings],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  async function changeStatus(booking: Booking, status: BookingStatus) {
    if (busyIdsRef.current.has(booking._id)) {
      return;
    }

    busyIdsRef.current.add(booking._id);
    setBusyIds(new Set(busyIdsRef.current));
    try {
      const result = await api<unknown>(
        `/bookings/${encodeURIComponent(booking._id)}/status`,
        { method: "PATCH", body: { status } },
      );
      if (!isStatusResponse(result)) {
        throw new Error("The booking status response was invalid.");
      }
      setBookings((current) =>
        current.map((item) =>
          item._id === result.booking._id ? result.booking : item,
        ),
      );
      toast.success(result.message || `Booking ${status.toLowerCase()}.`);
    } catch (statusError) {
      toast.error(getErrorMessage(statusError));
    } finally {
      busyIdsRef.current.delete(booking._id);
      setBusyIds(new Set(busyIdsRef.current));
    }
  }

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="Manage your creative spaces"
        title="Host Dashboard"
        subtitle="Review booking requests, respond to guests, and keep track of your studio activity."
      />

      <section className="mx-auto w-full max-w-[1312px] space-y-10 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <EmptyState
            title="We couldn't load your dashboard"
            message={error}
            actionLabel="Try again"
            onAction={retry}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="My listings"
                value={String(listings.length)}
                icon={<FiHome aria-hidden="true" />}
              />
              <StatCard
                label="Booking requests"
                value={String(bookings.length)}
                icon={<FiUsers aria-hidden="true" />}
              />
              <StatCard
                label="Pending requests"
                value={String(pendingCount)}
                icon={<FiCalendar aria-hidden="true" />}
              />
              <StatCard
                label="Confirmed earnings"
                value={formatCurrency(confirmedEarnings)}
                icon={<FiDollarSign aria-hidden="true" />}
              />
            </div>

            <section aria-labelledby="booking-requests-title">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    Guest activity
                  </p>
                  <h2
                    id="booking-requests-title"
                    className="mt-1 font-heading text-2xl font-semibold"
                  >
                    Booking requests
                  </h2>
                </div>
                <p className="text-sm text-muted">
                  {bookings.length} {bookings.length === 1 ? "request" : "requests"}
                </p>
              </div>

              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <DashboardRequestCard
                      key={booking._id}
                      booking={booking}
                      studio={studiosById.get(booking.studioId)}
                      busy={busyIds.has(booking._id)}
                      onChangeStatus={(selected, status) =>
                        void changeStatus(selected, status)
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No booking requests yet"
                  message="When a guest requests one of your studios, their booking details and available actions will appear here."
                  actionLabel={listings.length === 0 ? "Add New Studio" : "Explore Studios"}
                  actionHref={listings.length === 0 ? "/add-studio" : "/studios"}
                />
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <article className="flex min-h-28 min-w-0 items-center gap-4 rounded-2xl border border-base-300 bg-base-200 p-5 shadow-sm">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:size-6">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 break-words font-heading text-2xl font-semibold">
          {value}
        </p>
      </div>
    </article>
  );
}
