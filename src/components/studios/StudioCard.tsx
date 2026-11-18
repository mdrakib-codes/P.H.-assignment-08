"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiCamera, FiHeart, FiMapPin, FiStar } from "react-icons/fi";
import type { Studio } from "@/types";

interface StudioCardProps {
  studio: Studio;
  isWishlisted?: boolean;
  onToggleWishlist?: (studioId: string) => void;
}

export function StudioCard({
  studio,
  isWishlisted = false,
  onToggleWishlist,
}: StudioCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = studio.image || studio.gallery?.[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="relative h-[200px] shrink-0 overflow-hidden bg-base-300">
        {image && !imageFailed ? (
          <Image
            src={image}
            alt={`${studio.title} studio`}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid h-full place-items-center text-muted">
            <FiCamera aria-hidden="true" className="size-10" />
            <span className="sr-only">Studio image unavailable</span>
          </div>
        )}

        <span className="badge badge-primary absolute left-4 top-4 max-w-[70%] truncate shadow-md">
          {studio.category}
        </span>
        <button
          type="button"
          className="btn btn-circle btn-sm absolute right-4 top-4 border-base-300/70 bg-base-100/90 text-base-content shadow-md backdrop-blur transition hover:border-error/40 hover:bg-base-100 hover:text-error"
          aria-label={
            isWishlisted
              ? `Remove ${studio.title} from wishlist`
              : `Add ${studio.title} to wishlist`
          }
          aria-pressed={isWishlisted}
          onClick={() => onToggleWishlist?.(studio._id)}
        >
          <FiHeart
            aria-hidden="true"
            className={`size-4 ${
              isWishlisted ? "fill-current text-error" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 min-h-14 font-heading text-lg font-semibold leading-7">
          {studio.title}
        </h3>
        <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-muted">
          <FiMapPin
            aria-hidden="true"
            className="size-4 shrink-0 text-primary"
          />
          <span className="truncate">{studio.location}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <p className="font-semibold text-base-content">
            <span className="text-lg text-primary">
              ${studio.hourlyRate.toLocaleString("en-US")}
            </span>{" "}
            <span className="text-sm font-normal text-muted">/ hr</span>
          </p>
          <span className="badge badge-outline gap-1 border-base-300 px-2.5 py-3">
            <FiStar
              aria-hidden="true"
              className="size-3.5 fill-current text-primary"
            />
            <span>{studio.rating.toFixed(1)}</span>
          </span>
        </div>

        <Link
          href={`/studios/${encodeURIComponent(studio._id)}`}
          className="btn btn-primary mt-5 w-full"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
