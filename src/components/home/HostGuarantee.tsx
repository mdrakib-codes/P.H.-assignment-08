import Link from "next/link";
import {
  FiHeadphones,
  FiShield,
  FiTool,
  FiUserCheck,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const hostBenefits: {
  title: string;
  description: string;
  icon: IconType;
}[] = [
  {
    title: "Liability Protection",
    description:
      "Set clear studio rules and booking expectations before every session.",
    icon: FiShield,
  },
  {
    title: "Verified Profiles",
    description:
      "Get helpful context about the people and projects behind each booking.",
    icon: FiUserCheck,
  },
  {
    title: "Equipment Safety",
    description:
      "Share setup notes and house rules so guests know how to use your gear.",
    icon: FiTool,
  },
  {
    title: "24/7 Host Support",
    description:
      "Keep booking details and studio guidance close at hand whenever questions come up.",
    icon: FiHeadphones,
  },
];

export function HostGuarantee() {
  return (
    <section
      aria-labelledby="host-your-space-heading"
      className="border-y border-base-300 bg-base-200"
    >
      <div className="mx-auto grid max-w-[1312px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
            For studio owners
          </p>
          <h2
            id="host-your-space-heading"
            className="mt-3 font-heading text-3xl font-semibold leading-[1.15] sm:text-[40px]"
          >
            Your space could inspire what comes next
          </h2>
          <p className="mt-5 leading-7 text-muted">
            Put your studio in front of creators looking for a place to make.
            Share what makes your space special and turn available hours into
            new opportunities.
          </p>
          <Link href="/studios" className="btn btn-primary mt-7">
            Host Your Space
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hostBenefits.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="flex h-full flex-col rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6"
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
      </div>
    </section>
  );
}
