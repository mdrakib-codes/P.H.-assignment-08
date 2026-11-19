import Link from "next/link";
import { FiArrowRight, FiCompass, FiHeart, FiLayers, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";
import { PageHeader } from "@/components/ui/PageHeader";

const values: {
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    title: "Creativity first",
    description:
      "We help people find the environment and equipment that let an idea become real work.",
    icon: FiCompass,
  },
  {
    title: "Clarity at every step",
    description:
      "Listing details, booking times, prices, and status updates should be easy to understand.",
    icon: FiLayers,
  },
  {
    title: "Respect for both sides",
    description:
      "Creators and hosts deserve useful information and a considerate booking experience.",
    icon: FiHeart,
  },
  {
    title: "Reliable by design",
    description:
      "Availability checks, booking status, and clear expectations help everyone plan with confidence.",
    icon: FiShield,
  },
];

const stats = [
  { value: "5", label: "studio categories" },
  { value: "4", label: "creator booking steps" },
  { value: "3", label: "host listing steps" },
  { value: "2", label: "sides of one marketplace" },
];

const team = [
  {
    initials: "AR",
    name: "Avery Rahman",
    role: "Community and host experience",
  },
  {
    initials: "SN",
    name: "Samira Noor",
    role: "Creator experience",
  },
  {
    initials: "RK",
    name: "Rafi Karim",
    role: "Product and design",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <PageHeader
        eyebrow="A home for creative work"
        title="About StudioSpace"
        subtitle="We connect the people who make things with the studios that help them make their best work."
      />

      <div className="mx-auto max-w-[1312px] space-y-16 px-4 sm:px-6 lg:space-y-20 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              Our mission
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              Make creative spaces easier to find and share
            </h2>
            <p className="mt-5 leading-7 text-muted">
              StudioSpace helps creators discover studios that fit their
              projects and gives hosts a clear way to present their spaces and
              manage booking requests.
            </p>
          </div>
          <div className="space-y-5 leading-7 text-muted">
            <h2 className="font-heading text-2xl font-semibold text-base-content">
              The story behind the project
            </h2>
            <p>
              StudioSpace is a project built around a familiar challenge:
              finding a suitable place to photograph, record, rehearse, build,
              or produce can take more effort than the work itself.
            </p>
            <p>
              The project brings studio discovery, useful listing details,
              booking requests, and host tools into one experience. It is
              designed for both sides of the exchange: the creator planning a
              session and the host opening their space to new work.
            </p>
          </div>
        </section>

        <section aria-labelledby="values-title">
          <div className="mb-7 max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              What guides us
            </p>
            <h2
              id="values-title"
              className="mt-3 font-heading text-3xl font-semibold sm:text-4xl"
            >
              Built around creative people
            </h2>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-2xl border border-base-300 bg-base-200 p-5 sm:p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-label="StudioSpace at a glance"
          className="grid grid-cols-2 gap-3 rounded-3xl border border-base-300 bg-base-200 p-4 sm:gap-5 sm:p-7 lg:grid-cols-4"
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-base-300 bg-base-100 p-4 text-center sm:p-6"
            >
              <p className="font-heading text-3xl font-semibold text-primary sm:text-4xl">
                {value}
              </p>
              <p className="mt-2 text-sm text-muted">{label}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="team-title">
          <div className="mb-7 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
              The people behind the experience
            </p>
            <h2
              id="team-title"
              className="mt-3 font-heading text-3xl font-semibold sm:text-4xl"
            >
              A team that makes room for ideas
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
              Placeholder profiles representing the community, creator, and
              product roles that support StudioSpace.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {team.map(({ initials, name, role }) => (
              <article
                key={name}
                className="rounded-2xl border border-base-300 bg-base-200 p-6 text-center"
              >
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/15 font-heading text-xl font-semibold text-primary ring-2 ring-base-300">
                  {initials}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted">{role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/20 bg-primary/5 px-5 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            Your next project starts somewhere
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold sm:text-4xl">
            Find the space behind your next great idea
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">
            Explore studios built for photography, film, podcasts, music, and
            hands-on making.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/studios" className="btn btn-primary">
              Explore Studios <FiArrowRight aria-hidden="true" />
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
