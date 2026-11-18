"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { TbAperture } from "react-icons/tb";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Explore Studios", href: "/studios" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About Us", href: "/about" },
] as const;

const accountLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Add New Studio", href: "/add-studio" },
  { label: "My Studio Listings", href: "/my-listings" },
  { label: "My Bookings", href: "/my-bookings" },
  { label: "Wishlist", href: "/wishlist" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function navigationLinkClass(active: boolean, mobile = false) {
  const size = mobile
    ? "w-full px-4 py-3 text-base after:left-4 after:w-10"
    : "px-1 py-2 text-sm after:left-0 after:w-full";

  return [
    "relative inline-flex items-center rounded-lg font-medium transition-colors",
    "after:absolute after:bottom-0 after:h-0.5 after:origin-left after:bg-primary after:transition-transform",
    size,
    active
      ? "text-primary after:scale-x-100"
      : "text-base-content/80 after:scale-x-0 hover:text-base-content",
  ].join(" ");
}

function NavigationLinks({
  pathname,
  mobile = false,
  onNavigate,
}: {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {navigationLinks.map(({ label, href }) => {
        const active = isActiveRoute(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={navigationLinkClass(active, mobile)}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, isPending } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const desktopBreakpoint = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    };

    desktopBreakpoint.addEventListener("change", closeOnDesktop);
    return () =>
      desktopBreakpoint.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const menuButton = mobileMenuButtonRef.current;
    document.body.style.overflow = "hidden";
    mobileCloseButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [mobileMenuOpen]);

  function showLogoutNotice() {
    accountMenuRef.current?.removeAttribute("open");
    setMobileMenuOpen(false);
    toast.info("Logout will be available when authentication is connected.");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex min-h-16 w-full max-w-[1312px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 font-heading text-2xl font-bold tracking-tight"
          aria-label="StudioSpace home"
        >
          <TbAperture aria-hidden="true" className="size-8 text-primary" />
          <span>StudioSpace</span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <NavigationLinks pathname={pathname} />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {!isPending && user ? (
            <details
              ref={accountMenuRef}
              className="dropdown dropdown-end"
            >
              <summary
                className="btn btn-ghost btn-circle avatar cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                aria-label="Open account menu"
              >
                <span className="w-10 overflow-hidden rounded-full bg-primary/15 text-primary ring-2 ring-base-300">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full min-h-10 place-items-center text-sm font-semibold">
                      {getInitials(user.name)}
                    </span>
                  )}
                </span>
              </summary>
              <div className="dropdown-content z-50 mt-3 w-64 overflow-hidden rounded-box border border-base-300 bg-base-200 shadow-xl">
                <div className="border-b border-base-300 px-4 py-3">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="break-all text-sm text-muted">{user.email}</p>
                </div>
                <nav aria-label="Account menu">
                  <ul className="menu p-2">
                    {accountLinks.map(({ label, href }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() =>
                            accountMenuRef.current?.removeAttribute("open")
                          }
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button type="button" onClick={showLogoutNotice}>
                        <FiLogOut aria-hidden="true" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </details>
          ) : !isPending ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          ) : null}

          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="btn btn-ghost btn-circle btn-sm lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            {mobileMenuOpen ? (
              <FiX aria-hidden="true" className="size-5" />
            ) : (
              <FiMenu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-neutral/60 backdrop-blur-sm lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            id="mobile-navigation"
            ref={mobileDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col overflow-y-auto border-l border-base-300 bg-base-200 p-5 shadow-2xl lg:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <p
                id="mobile-navigation-title"
                className="font-heading text-lg font-semibold"
              >
                Explore StudioSpace
              </p>
              <button
                ref={mobileCloseButtonRef}
                type="button"
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiX aria-hidden="true" className="size-5" />
              </button>
            </div>

            <nav
              className="flex flex-col gap-2"
              aria-label="Mobile main navigation"
            >
              <NavigationLinks
                pathname={pathname}
                mobile
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </nav>

            <div className="mt-8 border-t border-base-300 pt-6">
              {!isPending && user ? (
                <>
                  <div className="mb-3">
                    <p className="font-semibold">{user.name}</p>
                    <p className="break-all text-sm text-muted">{user.email}</p>
                  </div>
                  <nav aria-label="Mobile account navigation">
                    <ul className="menu w-full p-0">
                      {accountLinks.map(({ label, href }) => (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button type="button" onClick={showLogoutNotice}>
                          <FiLogOut aria-hidden="true" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </nav>
                </>
              ) : !isPending ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    className="btn btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
