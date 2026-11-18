import type { BookingStatus, Category } from "@/types";

interface CategoryOption {
  value: Category;
  label: string;
  icon: string;
  count: number;
}

export const CATEGORIES = [
  {
    value: "Photo Studio",
    label: "Photo Studios",
    icon: "FiCamera",
    count: 0,
  },
  {
    value: "Film Stage",
    label: "Sound Stages",
    icon: "FiFilm",
    count: 0,
  },
  {
    value: "Podcast Lounge",
    label: "Podcast Rooms",
    icon: "FiMic",
    count: 0,
  },
  {
    value: "Music Suite",
    label: "Music Suites",
    icon: "FiMusic",
    count: 0,
  },
  {
    value: "Workshop",
    label: "Art Workshops",
    icon: "FiTool",
    count: 0,
  },
] as const satisfies readonly CategoryOption[];

export const AMENITY_OPTIONS = [
  "Air conditioning",
  "Acoustic treatment",
  "Backdrop stands",
  "Changing room",
  "Client lounge",
  "Cyclorama wall",
  "Digital piano",
  "Green screen",
  "High-speed Wi-Fi",
  "Lighting grid",
  "Makeup station",
  "Microphones",
  "Natural light",
  "Parking",
  "Production office",
  "Projector",
  "Sound-treated walls",
  "Studio monitors",
  "Utility sink",
  "Video equipment",
] as const;

export const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "border border-primary/30 bg-primary/10 text-primary",
  Confirmed: "border border-success/30 bg-success/10 text-success",
  Completed: "border border-info/30 bg-info/10 text-info",
  Cancelled: "border border-error/30 bg-error/10 text-error",
};
