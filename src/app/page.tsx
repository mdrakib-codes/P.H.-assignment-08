export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 px-6 py-24 text-base-content">
      <section className="w-full max-w-3xl rounded-box border border-base-300 bg-base-200 p-8 shadow-xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          Creative spaces, made accessible
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          StudioSpace
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          Discover inspiring studios for photography, film, sound, music, and
          hands-on making.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="badge badge-primary badge-outline">studiodark</span>
          <span className="badge badge-outline">studiolight ready</span>
        </div>
      </section>
    </main>
  );
}
