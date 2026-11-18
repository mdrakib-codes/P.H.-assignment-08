import Link from "next/link";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: {
    label: string;
    href: string;
  };
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-[1312px] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-end md:justify-between lg:px-8">
      <div className="max-w-3xl">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold leading-[1.15] sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted">{subtitle}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="btn btn-primary w-full shrink-0 md:w-auto"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}
