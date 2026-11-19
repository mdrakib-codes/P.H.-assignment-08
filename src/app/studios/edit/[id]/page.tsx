"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePrivateUser } from "@/components/auth/PrivateRouteGuard";
import {
  StudioForm,
  type StudioFormValues,
} from "@/components/studios/StudioForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { Studio } from "@/types";

type EditableStudio = Pick<
  Studio,
  | "_id"
  | "title"
  | "category"
  | "location"
  | "hourlyRate"
  | "securityDeposit"
  | "maxCapacity"
  | "image"
  | "gallery"
  | "amenities"
  | "overview"
  | "ownerEmail"
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isEditableStudio(value: unknown): value is EditableStudio {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.category === "string" &&
    CATEGORIES.some((category) => category.value === value.category) &&
    typeof value.location === "string" &&
    typeof value.hourlyRate === "number" &&
    typeof value.securityDeposit === "number" &&
    typeof value.maxCapacity === "number" &&
    typeof value.image === "string" &&
    isStringArray(value.gallery) &&
    isStringArray(value.amenities) &&
    typeof value.overview === "string" &&
    typeof value.ownerEmail === "string"
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Please try again in a moment.";
}

function EditStudioSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading studio for editing"
      className="animate-pulse space-y-6 rounded-2xl border border-base-300 bg-base-200 p-5 sm:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-28 rounded bg-base-300" />
            <div className="h-12 w-full rounded-btn bg-base-300" />
          </div>
        ))}
      </div>
      <div className="h-56 w-full rounded-xl bg-base-300" />
      <div className="h-32 w-full rounded-xl bg-base-300" />
      <div className="h-12 w-40 rounded-btn bg-base-300" />
      <span className="sr-only">Loading studio</span>
    </div>
  );
}

export default function EditStudioPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const user = usePrivateUser();
  const [studio, setStudio] = useState<EditableStudio | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isCurrentRequest = true;

    async function loadStudio() {
      try {
        const result = await api<unknown>(
          `/studios/${encodeURIComponent(id)}`,
        );
        if (!isEditableStudio(result)) {
          throw new Error("The studio response was invalid.");
        }

        if (isCurrentRequest) {
          setStudio(result);
          setError(null);
          setNotFound(false);
          setLoadedId(id);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setStudio(null);
          setNotFound(
            requestError instanceof ApiError && requestError.status === 404,
          );
          setError(getErrorMessage(requestError));
          setLoadedId(id);
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadStudio();

    return () => {
      isCurrentRequest = false;
    };
  }, [id, retryCount]);

  function retryLoading() {
    setError(null);
    setNotFound(false);
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }

  async function updateStudio(values: StudioFormValues) {
    setIsSubmitting(true);
    try {
      await api(`/studios/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: values,
      });
      toast.success("Studio listing updated successfully.");
      router.push("/my-listings");
    } catch (updateError) {
      toast.error(getErrorMessage(updateError));
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageHeader = (
    <PageHeader
      eyebrow="Your creative spaces"
      title="Update Studio"
      subtitle="Keep your studio information and amenities up to date."
    />
  );

  if (!id) {
    return (
      <main className="min-h-screen bg-base-100 pb-16">
        {pageHeader}
        <section className="px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Studio link is incomplete"
            message="Open a studio from your listings to update it."
            actionLabel="Back to My Listings"
            actionHref="/my-listings"
          />
        </section>
      </main>
    );
  }

  if (isLoading || loadedId !== id) {
    return (
      <main className="min-h-screen bg-base-100 pb-16">
        {pageHeader}
        <section className="mx-auto w-full max-w-[960px] px-4 sm:px-6 lg:px-8">
          <EditStudioSkeleton />
        </section>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-base-100 pb-16">
        {pageHeader}
        <section className="px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="Studio not found"
            message="This listing may have been removed or its link may have changed."
            actionLabel="Back to My Listings"
            actionHref="/my-listings"
          />
        </section>
      </main>
    );
  }

  if (error || !studio) {
    return (
      <main className="min-h-screen bg-base-100 pb-16">
        {pageHeader}
        <section className="px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="We couldn't load this studio"
            message={error ?? "The studio details were unavailable."}
            actionLabel="Try again"
            onAction={retryLoading}
          />
        </section>
      </main>
    );
  }

  if (
    !user ||
    studio.ownerEmail.toLocaleLowerCase() !== user.email.toLocaleLowerCase()
  ) {
    return (
      <main className="min-h-screen bg-base-100 pb-16">
        {pageHeader}
        <section className="px-4 sm:px-6 lg:px-8">
          <EmptyState
            title="You can only edit your own listings"
            message="This studio belongs to another host. You can manage studios you have listed from My Listings."
            actionLabel="Back to My Listings"
            actionHref="/my-listings"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      {pageHeader}
      <section className="mx-auto w-full max-w-[960px] px-4 sm:px-6 lg:px-8">
        <StudioForm
          key={studio._id}
          initialValues={{
            title: studio.title,
            category: studio.category,
            location: studio.location,
            hourlyRate: studio.hourlyRate,
            securityDeposit: studio.securityDeposit,
            maxCapacity: studio.maxCapacity,
            image: studio.image,
            gallery: studio.gallery,
            amenities: studio.amenities,
            overview: studio.overview,
          }}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          onSubmit={updateStudio}
        />
      </section>
    </main>
  );
}
