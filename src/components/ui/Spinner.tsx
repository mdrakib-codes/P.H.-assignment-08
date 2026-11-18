interface SpinnerProps {
  size?: number;
  label?: string;
  className?: string;
}

export function Spinner({
  size = 48,
  label = "Loading",
  className,
}: SpinnerProps) {
  const blades = Array.from({ length: 6 }, (_, index) => index);

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center ${className ?? ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="motion-safe:animate-spin motion-reduce:animate-none"
      >
        <g fill="var(--color-primary)">
          {blades.map((blade) => (
            <path
              key={blade}
              d="M32 6c8 5 12 12 10 20-1 6-5 10-12 13 2-7 0-13-4-18-4-6-2-12 6-15Z"
              opacity={1 - blade * 0.08}
              transform={`rotate(${blade * 60} 32 32)`}
            />
          ))}
        </g>
        <circle cx="32" cy="32" r="6" fill="var(--color-base-100)" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
