"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError, api } from "@/lib/api";
import type { Studio } from "@/types";

interface BookingModalProps {
  open: boolean;
  studio: Studio;
  date: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
  onConflict: () => void;
}

interface BookingFields {
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

type BookingField = keyof BookingFields;
type BookingFieldErrors = Partial<Record<BookingField, string>>;

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMinutes(value: string) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Please try submitting your booking again.";
}

export function BookingModal({
  open,
  studio,
  date,
  onDateChange,
  onClose,
  onConflict,
}: BookingModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onCloseRef = useRef(onClose);
  const isSubmittingRef = useRef(isSubmitting);
  const today = getTodayDate();

  useEffect(() => {
    onCloseRef.current = onClose;
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dateInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmittingRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), textarea:not([disabled])",
        );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialogRef.current?.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const durationHours =
    startMinutes !== null && endMinutes !== null && endMinutes > startMinutes
      ? (endMinutes - startMinutes) / 60
      : 0;
  const rentSubtotal = durationHours * studio.hourlyRate;

  function clearFieldError(field: BookingField) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
    setSubmitError(null);
  }

  function validate(): BookingFieldErrors {
    const errors: BookingFieldErrors = {};
    const todayDate = getTodayDate();

    if (!date) {
      errors.date = "Choose a booking date.";
    } else if (Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
      errors.date = "Enter a valid booking date.";
    } else if (date < todayDate) {
      errors.date = "The booking date cannot be in the past.";
    }

    if (startMinutes === null) {
      errors.startTime = "Choose a valid start time.";
    }
    if (endMinutes === null) {
      errors.endTime = "Choose a valid end time.";
    } else if (startMinutes !== null && endMinutes <= startMinutes) {
      errors.endTime = "End time must be after the start time.";
    } else if (
      startMinutes !== null &&
      endMinutes - startMinutes < 2 * 60
    ) {
      errors.endTime = "Bookings must be at least 2 hours.";
    }

    return errors;
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api("/bookings", {
        method: "POST",
        body: {
          studioId: studio._id,
          date,
          startTime,
          endTime,
          notes,
        },
      });

      toast.success("Booking request submitted successfully.");
      onClose();
      router.push("/my-bookings");
    } catch (error) {
      const message = getErrorMessage(error);
      setSubmitError(message);
      toast.error(message);
      if (error instanceof ApiError && error.status === 409) {
        onConflict();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="modal modal-open z-50">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close booking dialog"
        disabled={isSubmitting}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isSubmitting}
        tabIndex={-1}
        className="modal-box max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto border border-base-300 bg-base-200 p-5 shadow-2xl sm:p-8"
      >
        <h2 id={titleId} className="font-heading text-2xl font-semibold">
          Book {studio.title}
        </h2>
        <p id={descriptionId} className="mt-2 leading-7 text-muted">
          Choose your session time and review the estimated amount due.
        </p>

        <form className="mt-6 space-y-5" onSubmit={submitBooking} noValidate>
          {submitError && (
            <div role="alert" className="alert alert-error items-start">
              <span>{submitError}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control">
              <span className="label-text mb-2 font-medium">Booking date</span>
              <input
                ref={dateInputRef}
                type="date"
                min={today}
                value={date}
                aria-invalid={Boolean(fieldErrors.date)}
                aria-describedby={fieldErrors.date ? `${titleId}-date-error` : undefined}
                className="input input-bordered w-full bg-base-100"
                disabled={isSubmitting}
                onChange={(event) => {
                  onDateChange(event.target.value);
                  clearFieldError("date");
                }}
              />
              {fieldErrors.date && (
                <span
                  id={`${titleId}-date-error`}
                  className="mt-1 text-sm text-error"
                >
                  {fieldErrors.date}
                </span>
              )}
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="form-control">
                <span className="label-text mb-2 font-medium">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  aria-invalid={Boolean(fieldErrors.startTime)}
                  aria-describedby={
                    fieldErrors.startTime ? `${titleId}-start-error` : undefined
                  }
                  className="input input-bordered w-full bg-base-100"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setStartTime(event.target.value);
                    clearFieldError("startTime");
                    clearFieldError("endTime");
                  }}
                />
                {fieldErrors.startTime && (
                  <span
                    id={`${titleId}-start-error`}
                    className="mt-1 text-sm text-error"
                  >
                    {fieldErrors.startTime}
                  </span>
                )}
              </label>
              <label className="form-control">
                <span className="label-text mb-2 font-medium">End time</span>
                <input
                  type="time"
                  value={endTime}
                  aria-invalid={Boolean(fieldErrors.endTime)}
                  aria-describedby={
                    fieldErrors.endTime ? `${titleId}-end-error` : undefined
                  }
                  className="input input-bordered w-full bg-base-100"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setEndTime(event.target.value);
                    clearFieldError("endTime");
                  }}
                />
                {fieldErrors.endTime && (
                  <span
                    id={`${titleId}-end-error`}
                    className="mt-1 text-sm text-error"
                  >
                    {fieldErrors.endTime}
                  </span>
                )}
              </label>
            </div>
          </div>

          <label className="form-control">
            <span className="label-text mb-2 font-medium">
              Notes for the host <span className="text-muted">(optional)</span>
            </span>
            <textarea
              value={notes}
              rows={3}
              maxLength={1000}
              className="textarea textarea-bordered w-full bg-base-100"
              placeholder="Share a little about your session or setup needs."
              disabled={isSubmitting}
              onChange={(event) => {
                setNotes(event.target.value);
                clearFieldError("notes");
              }}
            />
          </label>

          <section
            aria-label="Booking price summary"
            className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5"
          >
            <h3 className="font-heading font-semibold">Price summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">
                  Studio time ({durationHours.toFixed(2)} hours ×{" "}
                  {formatCurrency(studio.hourlyRate)})
                </dt>
                <dd className="font-medium">{formatCurrency(rentSubtotal)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted">Refundable security deposit</dt>
                <dd className="font-medium">
                  {formatCurrency(studio.securityDeposit)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-base-300 pt-3 text-base">
                <dt className="font-semibold">Estimated booking total</dt>
                <dd className="font-semibold text-primary">
                  {formatCurrency(rentSubtotal)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-muted">
              The booking total covers studio time; the refundable security
              deposit is shown separately. The server calculates the final
              booking total.
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  aria-hidden="true"
                  className="loading loading-spinner loading-sm"
                />
              )}
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
