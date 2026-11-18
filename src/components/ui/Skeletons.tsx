function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-base-300 ${className}`}
    />
  );
}

export function StudioCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="flex min-h-[430px] animate-pulse flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-200"
    >
      <div className="relative h-[200px] shrink-0 bg-base-300">
        <div className="absolute left-4 top-4 h-6 w-24 rounded-full bg-base-200/80" />
        <div className="absolute right-4 top-4 size-9 rounded-full bg-base-200/80" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="h-5 w-3/4 rounded bg-base-300" />
        <div className="mt-3 h-4 w-1/2 rounded bg-base-300" />
        <div className="mt-auto flex items-center justify-between pt-7">
          <div className="h-5 w-24 rounded bg-base-300" />
          <div className="h-6 w-16 rounded-full bg-base-300" />
        </div>
        <div className="mt-5 h-11 w-full rounded-btn bg-base-300" />
      </div>
    </article>
  );
}

export function TableRowSkeleton() {
  return (
    <tr aria-hidden="true" className="animate-pulse border-b border-base-300">
      <td className="px-4 py-4">
        <SkeletonBlock className="size-14 rounded-lg" />
      </td>
      <td className="px-4 py-4">
        <SkeletonBlock className="h-4 w-36 max-w-full" />
        <SkeletonBlock className="mt-2 h-3 w-24 max-w-full rounded-full" />
      </td>
      <td className="px-4 py-4">
        <SkeletonBlock className="h-4 w-16" />
      </td>
      <td className="px-4 py-4">
        <SkeletonBlock className="h-4 w-28 max-w-full" />
      </td>
      <td className="px-4 py-4">
        <SkeletonBlock className="h-4 w-12" />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-16 rounded-btn" />
          <SkeletonBlock className="h-9 w-16 rounded-btn" />
        </div>
      </td>
    </tr>
  );
}

export function DetailsSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading studio details"
      className="mx-auto grid max-w-[1312px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)] lg:px-8"
    >
      <div aria-hidden="true" className="animate-pulse">
        <SkeletonBlock className="aspect-[16/9] w-full rounded-2xl" />
        <div className="mt-4 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="aspect-[4/3] w-full rounded-xl"
            />
          ))}
        </div>
        <div className="mt-8">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-4 h-8 w-2/3 max-w-full" />
          <SkeletonBlock className="mt-3 h-4 w-1/2 max-w-full" />
          <SkeletonBlock className="mt-7 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-5/6 max-w-full" />
          <SkeletonBlock className="mt-3 h-4 w-2/3 max-w-full" />
        </div>
      </div>

      <aside
        aria-hidden="true"
        className="h-fit animate-pulse rounded-2xl border border-base-300 bg-base-200 p-6"
      >
        <SkeletonBlock className="h-6 w-32" />
        <SkeletonBlock className="mt-5 h-12 w-full rounded-xl" />
        <SkeletonBlock className="mt-4 h-12 w-full rounded-xl" />
        <SkeletonBlock className="mt-7 h-11 w-full rounded-btn" />
      </aside>
      <span className="sr-only">Loading studio details</span>
    </section>
  );
}
