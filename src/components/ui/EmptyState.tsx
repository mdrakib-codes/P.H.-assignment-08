import Link from "next/link";
import { TbAperture } from "react-icons/tb";

interface EmptyStateContent {
  title: string;
  message: string;
  actionLabel: string;
}

type EmptyStateProps = EmptyStateContent &
  (
    | { actionHref: string; onAction?: never }
    | { actionHref?: never; onAction: () => void }
  );

export function EmptyState(props: EmptyStateProps) {
  const { title, message, actionLabel } = props;

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-base-300 bg-base-200 px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="mb-6 grid size-16 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary">
        <TbAperture aria-hidden="true" className="size-8" />
      </div>
      <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-lg leading-7 text-muted">{message}</p>
      {props.onAction ? (
        <button
          type="button"
          className="btn btn-primary mt-7"
          onClick={props.onAction}
        >
          {actionLabel}
        </button>
      ) : (
        <Link href={props.actionHref} className="btn btn-primary mt-7">
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
