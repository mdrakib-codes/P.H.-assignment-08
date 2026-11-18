"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { TbAperture } from "react-icons/tb";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
] as const;

const socialLinks = [
  { label: "X", href: "https://x.com", Icon: FaXTwitter },
  { label: "Instagram", href: "https://www.instagram.com", Icon: FaInstagram },
  { label: "YouTube", href: "https://www.youtube.com", Icon: FaYoutube },
  { label: "Facebook", href: "https://www.facebook.com", Icon: FaFacebookF },
] as const;

export function Footer() {
  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }

    toast.success("Thanks for subscribing!", {
      description: "Studio inspiration and updates are headed your way.",
    });
    form.reset();
  }

  return (
    <footer className="border-t border-base-300 bg-base-100">
      <div className="mx-auto grid max-w-[1312px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr] lg:gap-8 lg:px-8 lg:py-16">
        <section>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-2xl font-bold tracking-tight"
            aria-label="StudioSpace home"
          >
            <TbAperture aria-hidden="true" className="size-8 text-primary" />
            <span>StudioSpace</span>
          </Link>
          <p className="mt-4 max-w-sm leading-7 text-muted">
            Find the space behind your next great idea. We connect creators
            with inspiring studios built for making.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-circle btn-sm text-muted hover:text-primary"
                aria-label={`StudioSpace on ${label}`}
              >
                <Icon aria-hidden="true" className="size-4" />
              </a>
            ))}
          </div>
        </section>

        <nav aria-label="Quick links">
          <h2 className="font-heading text-base font-semibold">Quick links</h2>
          <ul className="mt-4 space-y-3">
            {quickLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-muted transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Popular studio categories">
          <h2 className="font-heading text-base font-semibold">
            Popular categories
          </h2>
          <ul className="mt-4 space-y-3">
            {CATEGORIES.map(({ value, label }) => (
              <li key={value}>
                <Link
                  href={`/studios?category=${encodeURIComponent(value)}`}
                  className="text-sm text-muted transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section>
          <h2 className="font-heading text-base font-semibold">
            A little more studio in your inbox
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Get occasional ideas, new spaces, and creative inspiration.
          </p>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
            onSubmit={handleNewsletterSubmit}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="input input-bordered min-w-0 flex-1 bg-base-200"
              required
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </section>
      </div>

      <div className="border-t border-base-300">
        <div className="mx-auto flex max-w-[1312px] flex-col gap-3 px-4 py-5 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 StudioSpace. All rights reserved.</p>
          <nav className="flex items-center gap-5" aria-label="Legal links">
            <Link
              href="/terms"
              className="transition-colors hover:text-primary"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-primary"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
