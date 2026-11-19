import Link from "next/link";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiEdit3,
  FiSearch,
  FiSend,
  FiUserCheck,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { PageHeader } from "@/components/ui/PageHeader";

const creatorSteps: {
  number: string;
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    number: "01",
    title: "Find the right space",
    description:
      "Search by name, category, price, and rating. Open a listing to review its photos, amenities, capacity, location, and host details.",
    icon: FiSearch,
  },
  {
    number: "02",
    title: "Choose a date and time",
    description:
      "Check the studio’s availability, select a date, and choose a time range that meets the two-hour minimum.",
    icon: FiCalendar,
  },
  {
    number: "03",
    title: "Send your booking request",
    description:
      "Add any useful notes and review the hourly booking price. A refundable security deposit, when applicable, is shown separately.",
    icon: FiSend,
  },
  {
    number: "04",
    title: "Get confirmed and create",
    description:
      "The host reviews the request and confirms it when the slot is available. You can follow the status in My Bookings and download an invoice for confirmed or completed bookings.",
    icon: FiCheckCircle,
  },
];

const hostSteps: {
  number: string;
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    number: "01",
    title: "Create a clear listing",
    description:
      "Add your studio’s title, category, location, rates, capacity, photos, amenities, and an overview that helps creators understand the space.",
    icon: FiEdit3,
  },
  {
    number: "02",
    title: "Review incoming requests",
    description:
      "See the guest, time range, and booking amount in your dashboard. Confirm a request or decline it when the timing does not work.",
    icon: FiClipboard,
  },
  {
    number: "03",
    title: "Host the session",
    description:
      "Share any final arrival or equipment details with your guest. After a confirmed session, mark the booking complete or cancel it if plans change.",
    icon: FiUserCheck,
  },
];

const faqs = [
  {
    question: "How do I find a studio for my project?",
    answer:
      "Open Explore Studios and use search, category, price, and sort controls to narrow the listings. Each studio page includes photos, amenities, capacity, location, and host information.",
  },
  {
    question: "Is my booking confirmed as soon as I submit it?",
    answer:
      "No. A new request is marked Pending until the host reviews and confirms it. You can track the latest status in My Bookings.",
  },
  {
    question: "What is the minimum booking duration?",
    answer:
      "StudioSpace booking requests must be at least two hours. The selected time range and hourly rate are shown before you submit.",
  },
  {
    question: "Is the security deposit included in the booking total?",
    answer:
      "No. The booking total is calculated from the hourly rate and booked hours. Any refundable security deposit is listed separately and is not included in that total.",
  },
  {
    question: "Can I cancel a booking request?",
    answer:
      "Guests can cancel a Pending request from My Bookings. Once a booking has been confirmed, contact the host to discuss changes; hosts can manage status from their dashboard.",
  },
  {
    question: "How do I list my studio?",
    answer:
      "Choose Add New Studio from your account menu, complete the listing form, and submit it. You can review, update, and manage your listings from My Listings.",
  },
];

function StepCards({
  steps,
}: {
  steps: typeof creatorSteps;
}) {
  return (
    <ol className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ number, title, description, icon: Icon }) => (
        <li
          key={number}
          className="flex h-full flex-col rounded-2xl border border-base-300 bg-base-200 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-semibold tracking-wider text-primary">
              {number}
            </span>
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon aria-hidden="true" className="size-5" />
            </span>
          </div>
          <h3 className="mt-6 font-heading text-lg font-semibold">{title}</h3>
          <p className="mt-2 flex-1 text-sm leading-6 text-muted">
            {description}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="A simple path from idea to session"
        title="How StudioSpace works"
        subtitle="Book an inspiring workspace as a creator or share your studio with people looking for a place to make."
      />

      <div className="mx-auto max-w-[1312px] space-y-16 px-4 sm:px-6 lg:space-y-20 lg:px-8">
        <section aria-labelledby="creator-steps-title">
          <div className="mb-7 max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              For creators
            </p>
            <h2
              id="creator-steps-title"
              className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl"
            >
              Book a space in four steps
            </h2>
            <p className="mt-4 leading-7 text-muted">
              Compare the details that matter, request the time you need, and
              keep the booking status and invoice together in your account.
            </p>
          </div>
          <StepCards steps={creatorSteps} />
          <Link href="/studios" className="btn btn-primary mt-7">
            Explore Studios <FiArrowRight aria-hidden="true" />
          </Link>
        </section>

        <section
          aria-labelledby="host-steps-title"
          className="rounded-3xl border border-base-300 bg-base-200 p-5 sm:p-8 lg:p-10"
        >
          <div className="mb-7 max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              For hosts
            </p>
            <h2
              id="host-steps-title"
              className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl"
            >
              Share your space in three steps
            </h2>
            <p className="mt-4 leading-7 text-muted">
              Make your listing easy to understand, respond to requests from
              one dashboard, and prepare each guest for a smooth session.
            </p>
          </div>
          <StepCards steps={hostSteps} />
          <Link href="/add-studio" className="btn btn-primary mt-7">
            List Your Studio <FiArrowRight aria-hidden="true" />
          </Link>
        </section>

        <section aria-labelledby="faq-title" className="mx-auto max-w-4xl">
          <div className="mb-7 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              Helpful details
            </p>
            <h2
              id="faq-title"
              className="mt-3 font-heading text-3xl font-semibold sm:text-4xl"
            >
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ question, answer }) => (
              <details
                key={question}
                className="collapse collapse-arrow rounded-2xl border border-base-300 bg-base-200"
              >
                <summary className="collapse-title min-h-14 pr-12 font-heading font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  {question}
                </summary>
                <div className="collapse-content">
                  <p className="leading-7 text-muted">{answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/20 bg-primary/5 px-5 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Make the next move
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold sm:text-4xl">
            Find a space or share the one you have
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">
            StudioSpace brings creators and studio hosts together around the
            work they want to make.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/studios" className="btn btn-primary">
              Explore Studios
            </Link>
            <Link href="/add-studio" className="btn btn-outline">
              List Your Studio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
