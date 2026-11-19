"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiAperture,
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { BookingModal } from "@/components/studios/BookingModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { DetailsSkeleton } from "@/components/ui/Skeletons";
import { Spinner } from "@/components/ui/Spinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ApiError, api } from "@/lib/api";
import type { Studio } from "@/types";

interface AvailabilityRange {
  startTime: string;
  endTime: string;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

function isValidImageUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isAvailabilityRange(value: unknown): value is AvailabilityRange {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("startTime" in value) || !("endTime" in value)) {
    return false;
  }

  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  return (
    typeof value.startTime === "string" &&
    timePattern.test(value.startTime) &&
    typeof value.endTime === "string" &&
    timePattern.test(value.endTime)
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return initials || "S";
}

function StudioGallery({ studio }: { studio: Studio }) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set(),
  );

  const images = useMemo(
    () =>
      Array.from(new Set([studio.image, ...studio.gallery])).filter(
        isValidImageUrl,
      ),
    [studio.gallery, studio.image],
  );

  function markImageFailed(image: string) {
    setFailedImages((currentImages) => new Set(currentImages).add(image));
  }

  function imageContent(image: string, className: string) {
    if (failedImages.has(image)) {
      return (
        <div
          className={`absolute inset-0 grid place-items-center bg-base-300 text-muted ${className}`}
        >
          <FiAperture aria-hidden="true" className="size-12" />
          <span className="sr-only">Studio image unavailable</span>
        </div>
      );
    }

    return (
      <Image
        src={image}
        alt={`${studio.title} studio`}
        fill
        sizes="(max-width: 1023px) 100vw, 65vw"
        className={`object-cover ${className}`}
        onError={() => markImageFailed(image)}
      />
    );
  }

  return (
    <section aria-label={`${studio.title} photo gallery`} className="mt-6">
      <div className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        {images.length > 0 ? (
          <>
            <Swiper
              modules={[A11y]}
              loop={images.length > 1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              className="studio-gallery"
              aria-roledescription="carousel"
              aria-label={`${studio.title} images`}
            >
              {images.map((image, index) => (
                <SwiperSlide
                  key={image}
                  aria-label={`${index + 1} of ${images.length}`}
                >
                  <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                    {imageContent(image, "transition-opacity duration-300")}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <span
              className="absolute right-4 top-4 z-10 rounded-full border border-base-content/15 bg-base-100/85 px-3 py-1.5 text-sm font-medium backdrop-blur"
              aria-live="polite"
            >
              {activeIndex + 1} / {images.length}
            </span>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn-circle btn-sm absolute left-3 top-1/2 z-10 -translate-y-1/2 border-base-content/20 bg-base-100/85 text-base-content shadow-md backdrop-blur hover:border-primary"
                  aria-label="Previous studio image"
                  onClick={() => swiperRef.current?.slidePrev()}
                >
                  <FiChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  className="btn btn-circle btn-sm absolute right-3 top-1/2 z-10 -translate-y-1/2 border-base-content/20 bg-base-100/85 text-base-content shadow-md backdrop-blur hover:border-primary"
                  aria-label="Next studio image"
                  onClick={() => swiperRef.current?.slideNext()}
                >
                  <FiChevronRight aria-hidden="true" className="size-5" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="grid aspect-[16/10] place-items-center text-muted sm:aspect-[16/9]">
            <div className="flex flex-col items-center gap-3">
              <FiAperture aria-hidden="true" className="size-12" />
              <p>Photos for this studio are not available yet.</p>
            </div>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          role="group"
          aria-label="Choose a studio image"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-36 ${
                activeIndex === index
                  ? "border-primary"
                  : "border-base-300 hover:border-primary/60"
              }`}
              aria-label={`Show studio image ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => swiperRef.current?.slideToLoop(index)}
            >
              {imageContent(image, "transition-opacity duration-300")}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function StudioDetails({ studio }: { studio: Studio }) {
  const { user } = useCurrentUser();
  const [availabilityDate, setAvailabilityDate] = useState(getTodayDate);
  const [availabilityRanges, setAvailabilityRanges] = useState<
    AvailabilityRange[]
  >([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [availabilityRetry, setAvailabilityRetry] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const isOwnListing =
    user?.email.toLowerCase() === studio.ownerEmail.toLowerCase();

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadAvailability() {
      setIsAvailabilityLoading(true);
      setAvailabilityError(null);
      const params = new URLSearchParams({
        studioId: studio._id,
        date: availabilityDate,
      });

      try {
        const result = await api<unknown>(
          `/bookings/availability?${params.toString()}`,
        );
        if (!Array.isArray(result)) {
          throw new Error("The availability response was invalid.");
        }

        const ranges: AvailabilityRange[] = [];
        for (const range of result) {
          if (!isAvailabilityRange(range)) {
            throw new Error("The availability response was invalid.");
          }
          ranges.push(range);
        }

        if (isCurrentRequest) {
          setAvailabilityRanges(ranges);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setAvailabilityRanges([]);
          setAvailabilityError(getErrorMessage(error));
        }
      } finally {
        if (isCurrentRequest) {
          setIsAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      isCurrentRequest = false;
    };
  }, [availabilityDate, availabilityRetry, studio._id]);

  const specificationTiles = [
    {
      label: "Maximum capacity",
      value: `${studio.maxCapacity} people`,
      Icon: FiUsers,
    },
    {
      label: "Security deposit",
      value: formatCurrency(studio.securityDeposit),
      Icon: FiShield,
    },
    {
      label: "Hourly rate",
      value: `${formatCurrency(studio.hourlyRate)} / hr`,
      Icon: FiDollarSign,
    },
    {
      label: "Minimum booking",
      value: "2 hours",
      Icon: FiClock,
    },
  ];

  return (
    <main className="min-h-screen bg-base-100 pb-16">
      <div className="mx-auto max-w-[1312px] px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/explore"
          aria-label="Back to Explore"
          className="btn btn-circle btn-ghost mb-3"
        >
          <FiArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-muted">
            <li>
              <Link href="/" className="transition hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/studios" className="transition hover:text-primary">
                Explore Studios
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="max-w-[60vw] truncate text-base-content" aria-current="page">
              {studio.title}
            </li>
          </ol>
        </nav>

        <StudioGallery key={studio._id} studio={studio} />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)] lg:gap-10">
          <div className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge badge-primary">{studio.category}</span>
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <FiStar
                    aria-hidden="true"
                    className="size-4 fill-current text-primary"
                  />
                  <span className="font-semibold">{studio.rating.toFixed(1)}</span>
                  <span className="text-muted">
                    ({studio.reviews.length}{" "}
                    {studio.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </span>
              </div>
              <h1 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                {studio.title}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-muted">
                <FiMapPin
                  aria-hidden="true"
                  className="size-4 shrink-0 text-primary"
                />
                {studio.location}
              </p>
            </header>

            <section
              aria-label="Studio host"
              className="mt-7 flex items-center gap-4 rounded-2xl border border-base-300 bg-base-200 p-5"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/15 font-heading text-lg font-semibold text-primary">
                {getInitials(studio.ownerName)}
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Studio host
                </span>
                <span className="mt-1 block font-medium">
                  Hosted by {studio.ownerName}
                </span>
              </span>
            </section>

            <section aria-label="Studio specifications" className="mt-7">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specificationTiles.map(({ label, value, Icon }) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-base-300 bg-base-200 p-4"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <p className="mt-4 text-xs leading-5 text-muted">{label}</p>
                    <p className="mt-1 font-heading text-sm font-semibold sm:text-base">
                      {value}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="studio-overview-heading" className="mt-10">
              <h2
                id="studio-overview-heading"
                className="font-heading text-2xl font-semibold"
              >
                About this studio
              </h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-muted">
                {studio.overview}
              </p>
            </section>

            <section aria-labelledby="studio-amenities-heading" className="mt-10">
              <h2
                id="studio-amenities-heading"
                className="font-heading text-2xl font-semibold"
              >
                Amenities
              </h2>
              {studio.amenities.length > 0 ? (
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {studio.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="badge badge-lg gap-2 border border-base-300 bg-base-200 px-3 py-4"
                    >
                      <FiCheck
                        aria-hidden="true"
                        className="size-4 text-success"
                      />
                      {amenity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-xl border border-base-300 bg-base-200 p-4 text-muted">
                  No amenities have been listed for this studio yet.
                </p>
              )}
            </section>

            <section aria-labelledby="studio-reviews-heading" className="mt-10">
              <h2
                id="studio-reviews-heading"
                className="font-heading text-2xl font-semibold"
              >
                Creator reviews
              </h2>
              {studio.reviews.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {studio.reviews.map((review, index) => (
                    <article
                      key={`${review.createdAt}-${review.name}-${index}`}
                      className="rounded-2xl border border-base-300 bg-base-200 p-5 sm:p-6"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-heading font-semibold">
                            {review.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted">{review.role}</p>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-primary"
                          aria-label={`${review.rating} out of 5 stars`}
                        >
                          {Array.from({ length: 5 }, (_, starIndex) => (
                            <FiStar
                              key={starIndex}
                              aria-hidden="true"
                              className={`size-4 ${
                                starIndex < Math.round(review.rating)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-4 leading-7 text-muted">{review.text}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reviews yet"
                  message="Creator feedback will appear here after guests have completed sessions at this studio."
                  actionLabel="Explore more studios"
                  actionHref="/studios"
                />
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-base-300 bg-base-200 p-5 shadow-lg sm:p-6">
              <p className="text-sm font-medium text-muted">Studio rate</p>
              <p className="mt-1 font-heading text-3xl font-semibold">
                <span className="text-primary">
                  {formatCurrency(studio.hourlyRate)}
                </span>
                <span className="ml-1 text-base font-normal text-muted">
                  / hr
                </span>
              </p>

              <section
                aria-labelledby="availability-heading"
                className="mt-6 border-t border-base-300 pt-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id="availability-heading"
                    className="font-heading text-lg font-semibold"
                  >
                    Availability
                  </h2>
                  <FiCalendar
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                </div>
                <label className="form-control mt-4">
                  <span className="label-text mb-2 text-sm font-medium">
                    Check a date
                  </span>
                  <input
                    type="date"
                    value={availabilityDate}
                    min={getTodayDate()}
                    className="input input-bordered w-full bg-base-100"
                    onChange={(event) =>
                      setAvailabilityDate(event.target.value || getTodayDate())
                    }
                  />
                </label>

                {isAvailabilityLoading ? (
                  <div
                    role="status"
                    aria-label="Loading availability"
                    className="mt-4 flex items-center gap-3 rounded-xl bg-base-100 p-4 text-sm text-muted"
                  >
                    <Spinner size={24} label="Loading availability" />
                    Checking confirmed bookings...
                  </div>
                ) : availabilityError ? (
                  <div className="mt-4 space-y-3">
                    <div role="alert" className="alert alert-error text-sm">
                      {availabilityError}
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() =>
                        setAvailabilityRetry((count) => count + 1)
                      }
                    >
                      Retry availability
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-base-100 p-4">
                    {availabilityRanges.length === 0 ? (
                      <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
                        <FiCheck aria-hidden="true" className="size-4" />
                        No confirmed bookings for this date
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-semibold">
                          Confirmed bookings
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {availabilityRanges.map((range) => (
                            <li
                              key={`${range.startTime}-${range.endTime}`}
                              className="badge badge-outline border-base-300 px-3 py-3 text-muted line-through"
                              aria-label={`Booked from ${range.startTime} to ${range.endTime}`}
                            >
                              {range.startTime} - {range.endTime}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="mt-3 text-xs leading-5 text-muted">
                      Times without a confirmed booking may be requested. The
                      host confirms each booking request.
                    </p>
                  </div>
                )}
              </section>

              <dl className="mt-5 space-y-3 border-t border-base-300 pt-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Security deposit</dt>
                  <dd className="font-medium">
                    {formatCurrency(studio.securityDeposit)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Maximum capacity</dt>
                  <dd className="font-medium">{studio.maxCapacity} people</dd>
                </div>
              </dl>

              {isOwnListing ? (
                <p className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center font-medium text-primary">
                  This is your listing
                </p>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary mt-6 w-full"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Book Workspace Now
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {isBookingOpen && (
        <BookingModal
          open={isBookingOpen}
          studio={studio}
          date={availabilityDate}
          onDateChange={setAvailabilityDate}
          onClose={() => setIsBookingOpen(false)}
          onConflict={() => setAvailabilityRetry((count) => count + 1)}
        />
      )}
    </main>
  );
}

export default function StudioDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : "";
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isCurrentRequest = true;

    async function loadStudio() {
      setIsLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const result = await api<Studio>(
          `/studios/${encodeURIComponent(id)}`,
        );
        if (!result) {
          throw new Error("The studio response was empty.");
        }

        if (isCurrentRequest) {
          setStudio(result);
        }
      } catch (requestError) {
        if (isCurrentRequest) {
          setStudio(null);
          if (
            requestError instanceof ApiError &&
            requestError.status === 404
          ) {
            setNotFound(true);
          } else {
            setError(getErrorMessage(requestError));
          }
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    void loadStudio();

    return () => {
      isCurrentRequest = false;
    };
  }, [id, retryCount]);

  if (!id) {
    return (
      <main className="min-h-screen bg-base-100 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Studio link is incomplete"
          message="Choose a studio from the Explore Studios page to view its details."
          actionLabel="Explore studios"
          actionHref="/studios"
        />
      </main>
    );
  }

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-base-100 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="Studio not found"
          message="This creative space may have been removed or its link may have changed."
          actionLabel="Explore studios"
          actionHref="/studios"
        />
      </main>
    );
  }

  if (error || !studio) {
    return (
      <main className="min-h-screen bg-base-100 px-4 py-10 sm:px-6 lg:px-8">
        <EmptyState
          title="We couldn't load this studio"
          message={error ?? "Please try again in a moment."}
          actionLabel="Try again"
          onAction={() => setRetryCount((count) => count + 1)}
        />
      </main>
    );
  }

  return <StudioDetails studio={studio} />;
}
