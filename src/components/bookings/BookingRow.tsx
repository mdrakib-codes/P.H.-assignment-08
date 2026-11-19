"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiCamera, FiClock, FiCalendar } from "react-icons/fi";
import type { Booking } from "@/types";
import { StatusBadge } from "@/components/bookings/StatusBadge";

interface BookingRowProps {
  booking: Booking;
  cancelling: boolean;
  generatingInvoice: boolean;
  onCancel: (booking: Booking) => void;
  onInvoice: (booking: Booking) => void;
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

function formatTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return value;
  }

  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function BookingRow({
  booking,
  cancelling,
  generatingInvoice,
  onCancel,
  onInvoice,
}: BookingRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hourlyRate =
    booking.hours > 0 ? booking.totalPrice / booking.hours : 0;
  const canDownloadInvoice =
    booking.status === "Confirmed" || booking.status === "Completed";

  return (
    <article className="grid gap-5 rounded-2xl border border-base-300 bg-base-200 p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
        <Link
          href={`/studios/${encodeURIComponent(booking.studioId)}`}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-base-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-40"
          aria-label={`View ${booking.studioTitle}`}
        >
          {booking.studioImage && !imageFailed ? (
            <Image
              src={booking.studioImage}
              alt={`${booking.studioTitle} studio`}
              fill
              sizes="(max-width: 639px) 100vw, 160px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="grid h-full place-items-center text-muted">
              <FiCamera aria-hidden="true" className="size-8" />
              <span className="sr-only">Studio image unavailable</span>
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/studios/${encodeURIComponent(booking.studioId)}`}
                className="break-words font-heading text-lg font-semibold hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {booking.studioTitle}
              </Link>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                <FiCalendar aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <span>{formatDate(booking.date)}</span>
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <FiClock aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <span>
              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
              {" · "}
              {booking.hours} {booking.hours === 1 ? "hour" : "hours"}
            </span>
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Hourly rate</dt>
              <dd className="mt-1 font-medium">{formatCurrency(hourlyRate)}</dd>
            </div>
            <div>
              <dt className="text-muted">Booking total</dt>
              <dd className="mt-1 font-semibold text-primary">
                {formatCurrency(booking.totalPrice)}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-muted">Booking ID</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {booking._id}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">
            Any refundable security deposit is handled separately.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
        {canDownloadInvoice && (
          <button
            type="button"
            className="btn btn-primary btn-sm min-w-36"
            disabled={generatingInvoice}
            onClick={() => onInvoice(booking)}
          >
            {generatingInvoice && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}
            Invoice PDF
          </button>
        )}
        {booking.status === "Pending" && (
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm min-w-36"
            disabled={cancelling}
            onClick={() => onCancel(booking)}
          >
            {cancelling && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}
            Cancel Booking
          </button>
        )}
      </div>
    </article>
  );
}
