import {
  FiAperture,
  FiCheckCircle,
  FiClock,
  FiSearch,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const steps: {
  number: string;
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    number: "01",
    title: "Discover Spaces",
    description:
      "Browse distinctive studios and find a space that fits your creative brief.",
    icon: FiSearch,
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    description:
      "Choose the date and hours that work for your schedule and production.",
    icon: FiClock,
  },
  {
    number: "03",
    title: "Book Instantly",
    description:
      "Share your booking details and secure the studio for your session.",
    icon: FiCheckCircle,
  },
  {
    number: "04",
    title: "Create and Produce",
    description:
      "Arrive ready to make, record, shoot and bring your next idea to life.",
    icon: FiAperture,
  },
];

export function HowBookingWorks() {
  return (
    <section
      aria-labelledby="how-booking-works-heading"
      className="mx-auto max-w-[1312px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="max-w-3xl">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
          From idea to booked
        </p>
        <h2
          id="how-booking-works-heading"
          className="mt-3 font-heading text-3xl font-semibold leading-[1.15] sm:text-[40px]"
        >
          Make room for the work
        </h2>
        <p className="mt-4 leading-7 text-muted">
          A few simple steps take you from searching for inspiration to making
          something real.
        </p>
      </div>

      <ol className="mt-9 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ number, title, description, icon: Icon }) => (
          <li
            key={number}
            className="flex h-full flex-col rounded-2xl border border-base-300 bg-base-200 p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-semibold tracking-[0.12em] text-primary">
                {number}
              </span>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
            <h3 className="mt-6 font-heading text-lg font-semibold">
              {title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
