"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { FiPlus, FiUpload, FiX } from "react-icons/fi";
import { AMENITY_OPTIONS, CATEGORIES } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Spinner } from "@/components/ui/Spinner";
import type { Category } from "@/types";

const STANDARD_AMENITIES = new Set<string>(AMENITY_OPTIONS);

export interface StudioFormValues {
  title: string;
  category: Category;
  location: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  image: string;
  gallery: string[];
  amenities: string[];
  overview: string;
}

interface StudioFormProps {
  initialValues?: Partial<StudioFormValues>;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: StudioFormValues) => Promise<void>;
}

interface StudioFormState {
  title: string;
  category: string;
  location: string;
  hourlyRate: string;
  securityDeposit: string;
  maxCapacity: string;
  image: string;
  gallery: string[];
  amenities: string[];
  overview: string;
}

type StudioFormField = keyof StudioFormState;
type StudioFormErrors = Partial<Record<StudioFormField, string>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category.value === value);
}

function createInitialState(
  initialValues: Partial<StudioFormValues> | undefined,
): StudioFormState {
  return {
    title: initialValues?.title ?? "",
    category: initialValues?.category ?? "",
    location: initialValues?.location ?? "",
    hourlyRate:
      initialValues?.hourlyRate === undefined
        ? ""
        : String(initialValues.hourlyRate),
    securityDeposit:
      initialValues?.securityDeposit === undefined
        ? ""
        : String(initialValues.securityDeposit),
    maxCapacity:
      initialValues?.maxCapacity === undefined
        ? ""
        : String(initialValues.maxCapacity),
    image: initialValues?.image ?? "",
    gallery: initialValues?.gallery ? [...initialValues.gallery] : [],
    amenities: initialValues?.amenities ? [...initialValues.amenities] : [],
    overview: initialValues?.overview ?? "",
  };
}

function getUploadErrorMessage(data: unknown) {
  if (isRecord(data)) {
    if (
      isRecord(data.error) &&
      typeof data.error.message === "string" &&
      data.error.message.trim()
    ) {
      return data.error.message;
    }

    if (typeof data.status_txt === "string" && data.status_txt.trim()) {
      return data.status_txt;
    }
  }

  return "ImgBB could not upload this image. Please try another file.";
}

export function StudioForm({
  initialValues,
  isSubmitting = false,
  submitLabel = "Create Studio Listing",
  onSubmit,
}: StudioFormProps) {
  const { user } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(() => createInitialState(initialValues));
  const [errors, setErrors] = useState<StudioFormErrors>({});
  const [customAmenity, setCustomAmenity] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function updateField<Field extends StudioFormField>(
    field: Field,
    value: StudioFormState[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): StudioFormErrors {
    const nextErrors: StudioFormErrors = {};
    const hourlyRate = Number(form.hourlyRate);
    const securityDeposit = Number(form.securityDeposit);
    const maxCapacity = Number(form.maxCapacity);

    if (!form.title.trim()) {
      nextErrors.title = "Enter a studio title.";
    }
    if (!isCategory(form.category)) {
      nextErrors.category = "Choose a studio category.";
    }
    if (!form.location.trim()) {
      nextErrors.location = "Enter the studio location or address.";
    }
    if (
      !form.hourlyRate.trim() ||
      !Number.isFinite(hourlyRate) ||
      hourlyRate <= 0
    ) {
      nextErrors.hourlyRate = "Hourly rate must be greater than zero.";
    }
    if (
      !form.securityDeposit.trim() ||
      !Number.isFinite(securityDeposit) ||
      securityDeposit < 0
    ) {
      nextErrors.securityDeposit =
        "Enter a security deposit of zero or more.";
    }
    if (
      !form.maxCapacity.trim() ||
      !Number.isSafeInteger(maxCapacity) ||
      maxCapacity < 1
    ) {
      nextErrors.maxCapacity = "Maximum capacity must be a positive whole number.";
    }
    if (!form.image.trim()) {
      nextErrors.image = "Enter a cover image URL or upload an image.";
    } else if (!getImageUrl(form.image)) {
      nextErrors.image = "Enter a valid HTTP or HTTPS image URL.";
    }
    if (
      form.gallery.some(
        (image) => image.trim() !== "" && getImageUrl(image) === null,
      )
    ) {
      nextErrors.gallery = "Each gallery entry must be a valid HTTP or HTTPS URL.";
    }
    if (form.overview.trim().length < 40) {
      nextErrors.overview = "Overview must be at least 40 characters.";
    }

    return nextErrors;
  }

  function toggleAmenity(amenity: string) {
    updateField(
      "amenities",
      form.amenities.includes(amenity)
        ? form.amenities.filter((item) => item !== amenity)
        : [...form.amenities, amenity],
    );
  }

  function addCustomAmenity() {
    const amenity = customAmenity.trim();
    if (
      !amenity ||
      form.amenities.some(
        (item) => item.toLocaleLowerCase() === amenity.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    updateField("amenities", [...form.amenities, amenity]);
    setCustomAmenity("");
  }

  async function uploadCoverImage(file: File) {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
    if (!apiKey) {
      setUploadError(
        "Image uploads are not configured. Add NEXT_PUBLIC_IMGBB_KEY to the client environment.",
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const body = new FormData();
    body.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
        { method: "POST", body },
      );
      const responseText = await response.text();
      let result: unknown = null;

      if (responseText) {
        try {
          result = JSON.parse(responseText) as unknown;
        } catch {
          throw new Error("ImgBB returned an unreadable response.");
        }
      }

      const imageData = isRecord(result) ? result.data : null;
      const imageUrl =
        isRecord(imageData) && typeof imageData.url === "string"
          ? getImageUrl(imageData.url)
          : null;

      if (!response.ok || !imageUrl) {
        throw new Error(getUploadErrorMessage(result));
      }

      updateField("image", imageUrl);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) {
      void uploadCoverImage(file);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const category = CATEGORIES.find(
      (option) => option.value === form.category,
    )?.value;
    const image = getImageUrl(form.image);
    if (!category || !image) {
      return;
    }

    const gallery = form.gallery
      .map((url) => getImageUrl(url))
      .filter((url): url is string => url !== null);

    await onSubmit({
      title: form.title.trim(),
      category,
      location: form.location.trim(),
      hourlyRate: Number(form.hourlyRate),
      securityDeposit: Number(form.securityDeposit),
      maxCapacity: Number(form.maxCapacity),
      image,
      gallery: gallery.length > 0 ? gallery : [image],
      amenities: form.amenities.map((amenity) => amenity.trim()),
      overview: form.overview.trim(),
    });
  }

  const coverImagePreview = getImageUrl(form.image);

  return (
    <form
      className="space-y-8 rounded-2xl border border-base-300 bg-base-200 p-5 shadow-sm sm:p-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="form-control md:col-span-2">
          <span className="label-text mb-2 font-medium">Studio title</span>
          <input
            type="text"
            value={form.title}
            autoComplete="off"
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.title)}
            onChange={(event) => updateField("title", event.target.value)}
          />
          {errors.title && <span className="mt-1 text-sm text-error">{errors.title}</span>}
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Category</span>
          <select
            value={form.category}
            className="select select-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.category)}
            onChange={(event) => updateField("category", event.target.value)}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="mt-1 text-sm text-error">{errors.category}</span>
          )}
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Location / Address</span>
          <input
            type="text"
            value={form.location}
            autoComplete="street-address"
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.location)}
            onChange={(event) => updateField("location", event.target.value)}
          />
          {errors.location && (
            <span className="mt-1 text-sm text-error">{errors.location}</span>
          )}
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Hourly Rate ($)</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.hourlyRate}
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.hourlyRate)}
            onChange={(event) => updateField("hourlyRate", event.target.value)}
          />
          {errors.hourlyRate && (
            <span className="mt-1 text-sm text-error">{errors.hourlyRate}</span>
          )}
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Security Deposit ($)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.securityDeposit}
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.securityDeposit)}
            onChange={(event) =>
              updateField("securityDeposit", event.target.value)
            }
          />
          {errors.securityDeposit && (
            <span className="mt-1 text-sm text-error">
              {errors.securityDeposit}
            </span>
          )}
        </label>

        <label className="form-control">
          <span className="label-text mb-2 font-medium">Maximum Capacity</span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.maxCapacity}
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.maxCapacity)}
            onChange={(event) => updateField("maxCapacity", event.target.value)}
          />
          {errors.maxCapacity && (
            <span className="mt-1 text-sm text-error">{errors.maxCapacity}</span>
          )}
        </label>
      </div>

      <section aria-labelledby="cover-image-heading" className="space-y-4">
        <div>
          <h2
            id="cover-image-heading"
            className="font-heading text-xl font-semibold"
          >
            Cover image
          </h2>
          <p className="mt-1 text-sm text-muted">
            Add an image URL or upload an image to ImgBB.
          </p>
        </div>
        <label className="form-control">
          <span className="label-text mb-2 font-medium">Cover Image URL</span>
          <input
            type="url"
            value={form.image}
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(errors.image)}
            onChange={(event) => {
              updateField("image", event.target.value);
              setUploadError(null);
            }}
          />
          {errors.image && (
            <span className="mt-1 text-sm text-error">{errors.image}</span>
          )}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Choose a cover image file"
            disabled={isUploading || isSubmitting}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn-outline"
            disabled={isUploading || isSubmitting}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Spinner size={20} label="Uploading cover image" />
                Uploading image...
              </>
            ) : (
              <>
                <FiUpload aria-hidden="true" className="size-4" />
                Upload a file instead
              </>
            )}
          </button>
          {uploadError && (
            <p role="alert" className="text-sm text-error">
              {uploadError}
            </p>
          )}
        </div>
        {coverImagePreview && (
          <div
            role="img"
            aria-label="Cover image preview"
            className="aspect-video max-h-80 w-full rounded-xl border border-base-300 bg-base-300 bg-cover bg-center"
            style={{
              backgroundImage: `url("${coverImagePreview}")`,
            }}
          />
        )}
      </section>

      <section aria-labelledby="gallery-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="gallery-heading" className="font-heading text-xl font-semibold">
              Gallery images
            </h2>
            <p className="mt-1 text-sm text-muted">
              Additional images are optional. If none are added, the cover
              image is used as the gallery image.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={isSubmitting}
            onClick={() => updateField("gallery", [...form.gallery, ""])}
          >
            <FiPlus aria-hidden="true" className="size-4" />
            Add gallery URL
          </button>
        </div>
        {form.gallery.map((image, index) => (
          <div key={index} className="flex items-start gap-2">
            <label className="form-control min-w-0 flex-1">
              <span className="label-text mb-2 font-medium">
                Gallery image URL {index + 1}
              </span>
              <input
                type="url"
                value={image}
                className="input input-bordered w-full bg-base-100"
                aria-invalid={Boolean(errors.gallery)}
                onChange={(event) => {
                  const gallery = [...form.gallery];
                  gallery[index] = event.target.value;
                  updateField("gallery", gallery);
                }}
              />
            </label>
            <button
              type="button"
              className="btn btn-square btn-ghost mt-7"
              aria-label={`Remove gallery image URL ${index + 1}`}
              disabled={isSubmitting}
              onClick={() =>
                updateField(
                  "gallery",
                  form.gallery.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            >
              <FiX aria-hidden="true" className="size-5" />
            </button>
          </div>
        ))}
        {errors.gallery && (
          <p role="alert" className="text-sm text-error">
            {errors.gallery}
          </p>
        )}
      </section>

      <section aria-labelledby="amenities-heading" className="space-y-4">
        <div>
          <h2
            id="amenities-heading"
            className="font-heading text-xl font-semibold"
          >
            Amenities
          </h2>
          <p className="mt-1 text-sm text-muted">
            Select the amenities available in your studio or add a custom one.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((amenity) => {
            const selected = form.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                className={`btn btn-sm ${
                  selected ? "btn-primary" : "btn-outline"
                }`}
                aria-pressed={selected}
                disabled={isSubmitting}
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={customAmenity}
            className="input input-bordered w-full bg-base-100"
            placeholder="Add a custom amenity"
            aria-label="Custom amenity"
            disabled={isSubmitting}
            onChange={(event) => setCustomAmenity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomAmenity();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-outline shrink-0"
            disabled={isSubmitting || !customAmenity.trim()}
            onClick={addCustomAmenity}
          >
            <FiPlus aria-hidden="true" className="size-4" />
            Add amenity
          </button>
        </div>
        {form.amenities.some((amenity) => !STANDARD_AMENITIES.has(amenity)) && (
          <ul className="flex flex-wrap gap-2" aria-label="Custom amenities">
            {form.amenities
              .filter((amenity) => !STANDARD_AMENITIES.has(amenity))
              .map((amenity) => (
                <li
                  key={amenity}
                  className="badge badge-lg gap-2 border border-primary/30 bg-primary/10 py-4"
                >
                  {amenity}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    aria-label={`Remove ${amenity}`}
                    disabled={isSubmitting}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    <FiX aria-hidden="true" className="size-3" />
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <label className="form-control">
        <span className="label-text mb-2 font-medium">Detailed Overview</span>
        <textarea
          value={form.overview}
          rows={6}
          className="textarea textarea-bordered w-full bg-base-100"
          aria-invalid={Boolean(errors.overview)}
          onChange={(event) => updateField("overview", event.target.value)}
        />
        <span className="mt-1 text-xs text-muted">
          {form.overview.trim().length} / 40 minimum characters
        </span>
        {errors.overview && (
          <span className="mt-1 text-sm text-error">{errors.overview}</span>
        )}
      </label>

      <section
        aria-labelledby="host-information-heading"
        className="rounded-xl border border-base-300 bg-base-100 p-5"
      >
        <h2
          id="host-information-heading"
          className="font-heading text-lg font-semibold"
        >
          Host information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text mb-2 font-medium">Host Name</span>
            <input
              type="text"
              value={user?.name ?? ""}
              readOnly
              className="input input-bordered w-full bg-base-200"
            />
          </label>
          <label className="form-control">
            <span className="label-text mb-2 font-medium">Host Email</span>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="input input-bordered w-full bg-base-200"
            />
          </label>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          Your account information is attached by the server when this listing is created.
        </p>
      </section>

      <div className="flex justify-end border-t border-base-300 pt-6">
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <>
              <Spinner size={20} label="Submitting studio" />
              Creating listing...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
