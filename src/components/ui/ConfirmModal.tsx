"use client";

import { useEffect, useId, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const loadingRef = useRef(loading);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    onCancelRef.current = onCancel;
    loadingRef.current = loading;
  }, [loading, onCancel]);

  useEffect(() => {
    if (open && loading) {
      dialogRef.current?.focus();
    }
  }, [loading, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (loadingRef.current) {
      dialogRef.current?.focus();
    } else {
      cancelButtonRef.current?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!loadingRef.current) {
          onCancelRef.current();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not([disabled])",
        );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const activeElementIsInside =
        dialogRef.current?.contains(document.activeElement) ?? false;
      const dialogHasFocus = document.activeElement === dialogRef.current;

      if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          dialogHasFocus ||
          !activeElementIsInside)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement ||
          dialogHasFocus ||
          !activeElementIsInside)
      ) {
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

  if (!open) {
    return null;
  }

  function cancel() {
    if (!loading) {
      onCancel();
    }
  }

  return (
    <div className="modal modal-open">
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Close confirmation dialog"
        disabled={loading}
        onClick={cancel}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        aria-busy={loading}
        tabIndex={-1}
        className="modal-box w-[calc(100%-2rem)] max-w-lg border border-base-300 bg-base-200 p-6 shadow-2xl sm:p-8"
      >
        <h2 id={titleId} className="font-heading text-2xl font-semibold">
          {title}
        </h2>
        <p id={messageId} className="mt-3 leading-7 text-muted">
          {message}
        </p>
        <div className="mt-8 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            ref={cancelButtonRef}
            type="button"
            className="btn btn-ghost"
            disabled={loading}
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn-error" : "btn-primary"}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
