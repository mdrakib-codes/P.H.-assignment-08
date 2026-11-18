export type Category =
  | "Photo Studio"
  | "Film Stage"
  | "Podcast Lounge"
  | "Music Suite"
  | "Workshop";

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface Review {
  name: string;
  role: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Studio {
  _id: string;
  title: string;
  category: Category;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  image: string;
  gallery: string[];
  amenities: string[];
  overview: string;
  ownerEmail: string;
  ownerName: string;
  rating: number;
  reviews: Review[];
  createdAt: string;
}

export interface Booking {
  _id: string;
  studioId: string;
  studioTitle: string;
  studioImage: string;
  hostEmail: string;
  userEmail: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  hours: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  image: string;
}
