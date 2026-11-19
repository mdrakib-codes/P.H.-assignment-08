# StudioSpace

**Find and book creative studios for your next production.** StudioSpace is a peer-to-peer creative workspace and production studio sharing platform where hosts list creative studios (photo studios, film stages, podcast lounges, music suites, workshops) and creators book them by the hour.

**Live site:** [Add your deployed client URL here]

---

## Features

- Hero slider with featured studio promotions
- Filters and search: category, price range, search keyword, and sorting
- Booking with double-booking prevention (server-side confirmed-slot overlap check, 409 on conflict)
- JWT cookie auth (HTTPOnly token cookie issued via `/api/jwt` after login)
- Dark/light theme (`studiodark` / `studiolight`) with localStorage persistence
- PDF invoices for confirmed and completed bookings (jsPDF + jspdf-autotable)
- Wishlist: save and unsave studios with optimistic UI updates
- Host dashboard: manage listings, view booking requests, confirm/complete/cancel bookings
- Studio management: create, edit, and delete your own studio listings with imgbb image upload
- Studio reviews and ratings
- Availability lookup by studio and date
- Responsive design (mobile, tablet, desktop)

---

## Technology Stack

**Client**
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + DaisyUI (two custom themes: `studiodark`, `studiolight`)
- React 19
- Sonner (toasts)
- Swiper (image gallery carousel)
- react-icons
- jsPDF + jspdf-autotable (PDF invoice generation)

**Server**
- Express 5 (JavaScript, CommonJS)
- MongoDB native driver
- JSON Web Tokens (JWT) with HTTPOnly cookies
- cookie-parser, cors, dotenv

---

## Local Setup

### Prerequisites

- Node.js 20 or later
- MongoDB Atlas cluster (or local MongoDB)
- imgbb API key (for image uploads)

### 1. Clone the client repository

```bash
git clone <CLIENT_REPO_URL>
cd studiospace-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SERVER_URL` | Backend API base URL | `http://localhost:5000` |
| `NEXT_PUBLIC_IMGBB_KEY` | imgbb API key for image uploads | `your-imgbb-api-key` |

### 4. Set up the server

Clone the server repository and configure its `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing JWTs | `replace-with-a-secure-secret` |
| `CLIENT_URL` | Client origin for CORS | `http://localhost:3000` |

Start the server:

```bash
npm install
npm run dev
```

Optionally seed the database with sample studios:

```bash
npm run seed
```

### 5. Run the client

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Server Repository

Server repo: <Add your server repository URL here>

Server live URL: <Add your deployed API URL here>

---

## Examiner Test Credentials

| Field | Value |
|-------|-------|
| Email | `<test-account-email>` |
| Password | `<test-account-password>` |

Create a test account through the Register page and record the credentials above for examiner access.

---

## Project Structure

```
studiospace-client/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── add-studio/              # Create studio listing
│   │   ├── dashboard/               # Host dashboard
│   │   ├── my-bookings/             # Guest bookings + PDF invoices
│   │   ├── my-listings/             # Host studio listings
│   │   ├── studios/                 # Explore, details, edit
│   │   ├── wishlist/                # Saved studios
│   │   ├── about/                   # About page
│   │   ├── how-it-works/            # How it works page
│   │   ├── layout.tsx               # Root layout
│   │   ├── loading.tsx              # Loading skeleton
│   │   └── not-found.tsx            # Custom 404
│   ├── components/
│   │   ├── bookings/                # BookingRow, StatusBadge
│   │   ├── home/                    # HeroSlider, FeaturedStudios, etc.
│   │   ├── layout/                  # Navbar, Footer, ThemeToggle
│   │   ├── studios/                 # StudioForm, BookingModal
│   │   └── ui/                      # ConfirmModal, EmptyState, Spinner, PageHeader, Skeletons
│   ├── hooks/                       # useCurrentUser, useWishlist, useTheme
│   ├── lib/                         # api, auth, auth-client, invoice, constants
│   └── types/                       # TypeScript interfaces
├── .env.example
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

ISC
