"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudioForm, type StudioFormValues } from "@/components/studios/StudioForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";

export default function AddStudioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createStudio(values: StudioFormValues) {
    setIsSubmitting(true);
    try {
      await api("/studios", {
        method: "POST",
        body: values,
      });
      toast.success("Studio listing created successfully.");
      router.push("/my-listings");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create the studio listing. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="Host on StudioSpace"
        title="List your creative space"
        subtitle="Share the details, equipment, and amenities that help creators imagine what they can make in your studio."
      />
      <section className="mx-auto w-full max-w-[960px] px-4 sm:px-6 lg:px-8">
        <StudioForm isSubmitting={isSubmitting} onSubmit={createStudio} />
      </section>
    </main>
  );
}
