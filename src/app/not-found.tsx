import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[1312px] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <svg
        viewBox="0 0 480 320"
        role="img"
        aria-labelledby="not-found-scene-title"
        className="mb-8 w-full max-w-lg"
      >
        <title id="not-found-scene-title">
          A camera on a tripod beneath a studio spotlight
        </title>
        <defs>
          <linearGradient id="spotlight-beam" x1="0" x2="0.2" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.4"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        <path
          d="M337 42h56L295 233h-93L337 42Z"
          fill="url(#spotlight-beam)"
        />
        <path
          d="M337 30h62l-8 22h-62l8-22Z"
          fill="var(--color-base-200)"
          stroke="var(--color-base-300)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="368" cy="28" r="12" fill="var(--color-primary)" />
        <path
          d="M110 276h260"
          stroke="var(--color-base-300)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <g
          fill="var(--color-base-200)"
          stroke="var(--color-base-content)"
          strokeWidth="4"
          strokeLinejoin="round"
        >
          <path d="M188 124h107a12 12 0 0 1 12 12v53H176v-53a12 12 0 0 1 12-12Z" />
          <path d="m205 124 12-17h39l12 17" />
          <path d="M305 137h15v30h-15" />
          <path d="M230 189h28v18h-28z" />
        </g>
        <circle
          cx="240"
          cy="157"
          r="25"
          fill="var(--color-base-100)"
          stroke="var(--color-primary)"
          strokeWidth="7"
        />
        <circle cx="240" cy="157" r="9" fill="var(--color-primary)" />

        <g
          fill="none"
          stroke="var(--color-base-content)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M244 208v23" />
          <path d="m244 230-47 44" />
          <path d="m244 230 47 44" />
          <path d="M244 230v48" />
        </g>
        <path
          d="M191 279h106"
          stroke="var(--color-primary)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
        Out of frame
      </p>
      <h1 className="mt-3 max-w-3xl font-heading text-3xl font-semibold leading-tight sm:text-[40px]">
        This scene did not make the final cut
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-muted">
        The page you are looking for may have moved or is no longer available.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Return to Home
      </Link>
    </main>
  );
}
