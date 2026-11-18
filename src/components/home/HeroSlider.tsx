"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { A11y, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import "swiper/css";
import "swiper/css/effect-fade";

const slides = [
  {
    image: "https://picsum.photos/seed/studiocreative/1600/1000",
    headline: "Book the room where your next idea gets made",
    description:
      "Discover inspiring, well-equipped spaces for photography, film, sound, and every idea ready to take shape. Find your fit, choose your time, and book with confidence.",
    studio: "The Daylight Loft",
    location: "Brooklyn, New York",
  },
  {
    image: "https://picsum.photos/seed/filmproduction/1600/1000",
    headline: "Record, film and shoot on a stage built for it",
    description:
      "From sunlit photo studios to production-ready film stages and creator suites, find the right space and setup to bring every frame to life.",
    studio: "Northlight Film Stage",
    location: "Los Angeles, California",
  },
  {
    image: "https://picsum.photos/seed/podcaststudio/1600/1000",
    headline: "Got a space sitting empty? Put it to work",
    description:
      "Give your studio a place in someone else's next big idea. List your space, meet local creators, and earn whenever your studio is booked.",
    studio: "The Creators' Annex",
    location: "Austin, Texas",
  },
] as const;

export function HeroSlider() {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  function toggleAutoplay() {
    const swiper = swiperRef.current;

    if (!swiper) {
      return;
    }

    if (autoplayPaused) {
      swiper.autoplay.start();
      setAutoplayPaused(false);
    } else {
      swiper.autoplay.stop();
      setAutoplayPaused(true);
    }
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-base-200"
      aria-label="Featured creative studios"
    >
      <Swiper
        modules={[A11y, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop
        speed={850}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
        className="hero-slider h-[min(800px,calc(100svh_-_4rem))] min-h-[640px]"
        aria-label="StudioSpace featured studios"
        aria-roledescription="carousel"
      >
        {slides.map((slide, index) => {
          const Heading = activeIndex === index ? "h1" : "h2";
          const isActive = activeIndex === index;

          return (
            <SwiperSlide
              key={slide.headline}
              className="relative h-full"
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <div
                aria-hidden="true"
                className={`absolute inset-0 scale-100 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                  isActive ? "scale-105" : ""
                }`}
                style={{ backgroundImage: `url("${slide.image}")` }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-base-100/95 via-base-100/80 to-base-100/30"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-base-100/70 via-transparent to-base-100/15"
              />

              <div className="relative mx-auto flex h-full w-full max-w-[1312px] flex-col justify-center px-4 pb-44 pt-16 sm:px-6 sm:pb-44 sm:pt-20 lg:px-8 lg:pb-40">
                <div className="max-w-3xl">
                  <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-base-content/15 bg-base-100/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur-md sm:text-sm">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                    Space to make something
                  </p>
                  <Heading className="max-w-3xl text-4xl font-bold leading-[1.06] tracking-tight text-base-content sm:text-5xl md:text-6xl lg:text-7xl">
                    {slide.headline}
                  </Heading>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-base-content/80 sm:mt-6 sm:text-lg sm:leading-8">
                    {slide.description}
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                    <Link
                      href="/studios"
                      className="btn btn-primary min-h-12 px-6 text-base"
                    >
                      Explore Studios
                    </Link>
                    <Link
                      href="/studios"
                      className="btn btn-outline min-h-12 border-base-content/35 bg-base-100/40 px-6 text-base text-base-content backdrop-blur-sm hover:border-primary hover:bg-primary/10 hover:text-base-content"
                    >
                      Host Your Space
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 mx-auto max-w-[1312px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div
            className="pointer-events-auto flex w-fit max-w-full items-center gap-3 rounded-xl border border-base-content/15 bg-base-100/75 px-3 py-2.5 text-base-content shadow-lg backdrop-blur-lg sm:px-4"
            aria-live="polite"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
              <FiMapPin aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                Featured studio
              </span>
              <span className="block truncate text-sm font-semibold sm:text-base">
                {slides[activeIndex].studio}
              </span>
              <span className="block truncate text-xs text-base-content/70 sm:text-sm">
                {slides[activeIndex].location}
              </span>
            </span>
          </div>

          <div className="pointer-events-auto flex items-center justify-end gap-3">
            <div
              className="flex items-center gap-1.5"
              role="group"
              aria-label="Choose a slide"
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.headline}
                  type="button"
                  className="grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  onClick={() => swiperRef.current?.slideToLoop(index)}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === index
                        ? "w-6 bg-primary"
                        : "w-2 bg-base-content/55 hover:bg-base-content"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-circle size-11 border-base-content/25 bg-base-100/75 text-base-content shadow-lg backdrop-blur-md hover:border-primary hover:bg-base-200"
                aria-label={autoplayPaused ? "Play slideshow" : "Pause slideshow"}
                aria-pressed={autoplayPaused}
                onClick={toggleAutoplay}
              >
                {autoplayPaused ? (
                  <FiPlay aria-hidden="true" className="size-4" />
                ) : (
                  <FiPause aria-hidden="true" className="size-4" />
                )}
              </button>
              <button
                type="button"
                className="btn btn-circle size-11 border-base-content/25 bg-base-100/75 text-base-content shadow-lg backdrop-blur-md hover:border-primary hover:bg-base-200"
                aria-label="Previous slide"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <FiChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                className="btn btn-circle size-11 border-base-content/25 bg-base-100/75 text-base-content shadow-lg backdrop-blur-md hover:border-primary hover:bg-base-200"
                aria-label="Next slide"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <FiChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
