import Link from "next/link";
import { TbAperture } from "react-icons/tb";

interface AuthShellProps {
  children: React.ReactNode;
}

const highlights = [
  "Curated photo, film and audio studios",
  "Transparent hourly pricing",
  "One place for hosts and creators",
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-base-100">
      <section className="relative hidden w-1/2 overflow-hidden bg-base-200 lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-base-200 to-base-100"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 size-96 rounded-full bg-info/10 blur-3xl"
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 font-heading text-2xl font-bold"
          >
            <TbAperture aria-hidden="true" className="size-8 text-primary" />
            <span>StudioSpace</span>
          </Link>

          <div className="max-w-md space-y-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              Creative space, on demand
            </p>
            <h2 className="font-heading text-4xl font-semibold leading-[1.15] xl:text-5xl">
              Where great work finds its space.
            </h2>
            <p className="leading-7 text-muted">
              Find a studio that fits your shoot, book the hours you need, and
              get back to making something worth sharing.
            </p>
            <ul className="space-y-3 pt-2">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-muted">StudioSpace · Built for makers.</p>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        {children}
      </section>
    </main>
  );
}
