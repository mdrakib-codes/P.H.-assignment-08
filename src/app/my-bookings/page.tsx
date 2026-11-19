"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BookingRow } from "@/components/bookings/BookingRow";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import { generateInvoice, type InvoiceStudio } from "@/lib/invoice";
import { CATEGORIES } from "@/lib/constants";
import type { Booking, BookingStatus } from "@/types";

type BookingFilter = "All" | BookingStatus;

const FILTERS: readonly BookingFilter[] = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];
const BOOKING_STATUSES: readonly BookingStatus[] = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

interface CancelResponse {
  message: string;
  booking: Booking;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBookingStatus(value: unknown): value is BookingStatus {
  return (
    typeof value === "string" &&
    BOOKING_STATUSES.some((status) => status === value)
  );
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
    value.hours > 0 &&
    typeof value.totalPrice === "number" &&
    Number.isFinite(value.totalPrice) &&
    isBookingStatus(value.status) &&
    typeof value.createdAt === "string"
  );
}

function isCancelResponse(value: unknown): value is CancelResponse {
  return (
    isRecord(value) &&
    typeof value.message === "string" &&
    isBooking(value.booking)
  );
}

function isInvoiceStudio(value: unknown): value is InvoiceStudio {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    typeof value.category === "string" &&
    CATEGORIES.some((category) => category.value === value.category) &&
    typeof value.location === "string" &&
    typeof value.hourlyRate === "number" &&
    typeof value.securityDeposit === "number" &&
    typeof value.ownerName === "string" &&
    typeof value.ownerEmail === "string"
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Please try again in a moment.";
}

function BookingsSkeleton() {
  return (
    <div role="status" aria-label="Loading bookings" className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="animate-pulse rounded-2xl border border-base-300 bg-base-200 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="aspect-[4/3] w-full rounded-xl bg-base-300 sm:w-40" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-2/3 rounded bg-base-300" />
              <div className="h-4 w-1/2 rounded bg-base-300" />
              <div className="h-16 w-full rounded bg-base-300" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading your bookings</span>
    </div>
  );
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>("All");
  const [retryCount, setRetryCount] = useState(0);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const cancelInFlight = useRef(false);
  const invoiceInFlight = useRef(new Set<string>());

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadBookings() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api<unknown>("/bookings/mine");
        if (!Array.isArray(result) || !result.every(isBooking)) {
          throw new Error("The bookings response was invalid.");
        }
        if (isCurrentRequest) {
          setBookings(result);
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

    void loadBookings();
    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  const counts = useMemo(() => {
    const result: Record<BookingFilter, number> = {
      All: bookings.length,
      Pending: 0,
      Confirmed: 0,
      Completed: 0,
      Cancelled: 0,
    };
    for (const booking of bookings) {
      result[booking.status] += 1;
    }
    return result;
  }, [bookings]);

  const filteredBookings = useMemo(
    () =>
      filter === "All"
        ? bookings
        : bookings.filter((booking) => booking.status === filter),
    [bookings, filter],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  async function cancelBooking() {
    const selected = bookingToCancel;
    if (!selected || cancelInFlight.current) {
      return;
    }

    cancelInFlight.current = true;
    setCancellingId(selected._id);
    try {
      const result = await api<unknown>(
        `/bookings/${encodeURIComponent(selected._id)}/cancel`,
        { method: "PATCH" },
      );
      if (!isCancelResponse(result)) {
        throw new Error("The cancellation response was invalid.");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === result.booking._id ? result.booking : booking,
        ),
      );
      setBookingToCancel(null);
      toast.success(result.message || "Booking cancelled successfully.");
    } catch (cancelError) {
      toast.error(getErrorMessage(cancelError));
    } finally {
      cancelInFlight.current = false;
      setCancellingId(null);
    }
  }

  async function downloadInvoice(booking: Booking) {
    if (invoiceInFlight.current.has(booking._id)) {
      return;
    }

    invoiceInFlight.current.add(booking._id);
    setInvoiceId(booking._id);
    try {
      const result = await api<unknown>(
        `/studios/${encodeURIComponent(booking.studioId)}`,
      );
      if (!isInvoiceStudio(result)) {
        throw new Error("Studio invoice details were unavailable.");
      }

      generateInvoice(booking, result);
      toast.success("Invoice PDF downloaded.");
    } catch (invoiceError) {
      toast.error(`Couldn't generate invoice. ${getErrorMessage(invoiceError)}`);
    } finally {
      invoiceInFlight.current.delete(booking._id);
      setInvoiceId(null);
    }
  }

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="Your StudioSpace activity"
        title="My Bookings"
        subtitle="Review booking details, track each status, and download invoices for confirmed or completed bookings."
      />

      <section className="mx-auto w-full max-w-[1312px] px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <BookingsSkeleton />
        ) : error ? (
          <EmptyState
            title="We couldn't load your bookings"
            message={error}
            actionLabel="Try again"
            onAction={retry}
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            message="Find a creative space for your next project and your bookings will appear here."
            actionLabel="Explore Studios"
            actionHref="/studios"
          />
        ) : (
          <>
            <div
              className="mb-6 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter bookings by status"
            >
              {FILTERS.map((bookingFilter) => (
                <button
                  key={bookingFilter}
                  type="button"
                  className={`btn btn-sm ${
                    filter === bookingFilter ? "btn-primary" : "btn-outline"
                  }`}
                  aria-pressed={filter === bookingFilter}
                  onClick={() => setFilter(bookingFilter)}
                >
                  {bookingFilter} <span>({counts[bookingFilter]})</span>
                </button>
              ))}
            </div>

            {filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    cancelling={cancellingId === booking._id}
                    generatingInvoice={invoiceId === booking._id}
                    onCancel={setBookingToCancel}
                    onInvoice={(selected) => void downloadInvoice(selected)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`No ${filter.toLowerCase()} bookings`}
                message={`You do not have any ${filter.toLowerCase()} bookings right now.`}
                actionLabel="Show all bookings"
                onAction={() => setFilter("All")}
              />
            )}
          </>
        )}
      </section>

      <ConfirmModal
        open={bookingToCancel !== null}
        title="Cancel this booking?"
        message={
          bookingToCancel
            ? `Cancel your booking for "${bookingToCancel.studioTitle}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Cancel booking"
        danger
        loading={cancellingId !== null}
        onConfirm={() => void cancelBooking()}
        onCancel={() => setBookingToCancel(null)}
      />
    </main>
  );
}
