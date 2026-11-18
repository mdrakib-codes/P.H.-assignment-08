import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 bg-base-100 px-6 py-20">
      <div className="rounded-full border border-primary/20 bg-base-200 p-5 shadow-xl">
        <Spinner size={64} label="Loading StudioSpace" />
      </div>
      <p className="font-heading text-sm font-medium tracking-wide text-muted">
        Preparing the next scene
      </p>
    </main>
  );
}
