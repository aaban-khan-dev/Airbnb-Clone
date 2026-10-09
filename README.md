# Airbnb Clone — Full-Stack Stay Booking Platform

A full-stack accommodation booking application built for the Scaler SDE Fullstack assignment. Guests can discover stays, filter listings, view property details, book date ranges, and manage trips. Hosts can create and manage listings and review reservations.

The interface follows a photo-first marketplace layout with responsive pages, listing galleries, booking summaries, dialogs, and toast notifications.

- **Live application:** _Add your Vercel deployment URL_
- **API documentation:** _Add your Railway deployment URL_ followed by `/docs`
- **GitHub repository:** _Add your repository URL_

> **Project note:** This is an independent assignment project. It uses its own implementation and branding and is not affiliated with Airbnb.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Technology Stack](#technology-stack)
- [System Design and Architecture](#system-design-and-architecture)
- [Booking Concurrency and Availability](#booking-concurrency-and-availability)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Assumptions and Scope](#assumptions-and-scope)
- [Challenges and Implementation Notes](#challenges-and-implementation-notes)
- [Known Limitations](#known-limitations)
- [Potential Improvements](#potential-improvements)

## Features

  -----------------------------------------------------------------------
  Area                                Features
  ----------------------------------- -----------------------------------
  **Home and search**                 Photo-card grid with carousel
                                      controls; location, date, and guest
                                      search; category navigation;
                                      filters for price, property type,
                                      and amenities; live result counts;
                                      infinite scrolling; list and map
                                      views.

  **Listing details**                 Photo gallery; expandable property
                                      description; sleeping arrangements;
                                      amenities; availability calendar
                                      with booked nights marked; price
                                      breakdown; reviews; approximate
                                      area map; host information; house
                                      rules, safety information, and
                                      cancellation policy.

  **Booking**                         Guest and date validation; checkout
                                      summary with mocked payment;
                                      booking confirmation; upcoming,
                                      past, and cancelled trips; trip
                                      cancellation; overlap protection in
                                      both the API and database.

  **Host tools**                      Dashboard with listing statistics;
                                      create, edit, and deactivate
                                      listings; configure photo URLs,
                                      amenities, bedrooms, and house
                                      rules; view reservations across
                                      owned listings.

  **Marketplace experience**          Wishlists; action toasts; reusable
                                      dialogs; responsive mobile
                                      navigation and a bottom reservation
                                      bar.

  **Optional enhancements**           Interactive map with price pins;
                                      reviews after completed stays;
                                      aggregated ratings; Superhost and
                                      Guest favourite badges; light,
                                      dark, and system theme options;
                                      layouts for mobile, tablet, and
                                      desktop.

  **Mocked or placeholder features**  Demo-user switching instead of real
                                      login; simulated checkout;
                                      messaging marked as coming soon;
                                      placeholder language and currency
                                      controls.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Getting Started

### Prerequisites

-   Python 3.11 or later
-   Node.js 20.9 or later and npm (required by Next.js 16)
-   Git

### 1. Clone the repository

``` bash
git clone <your-repo-url>
cd airbnb-clone
```

Replace `<your-repo-url>` with the repository URL. If the repository
directory has a different name, change the `cd` command accordingly.

### 2. Start the backend

The FastAPI service runs on port `8000`.

``` bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

**Windows PowerShell**

``` powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux**

``` bash
source .venv/bin/activate
```

Install the dependencies and launch the development server:

``` bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On first startup, the application creates `backend/airbnb.db` and seeds
it with demo data. Interactive API documentation is available at
<http://localhost:8000/docs>.

Optional backend configuration can be supplied through `backend/.env`;
see `backend/.env.example`.

  -------------------------------------------------------------------------
  Variable                Default                   Purpose
  ----------------------- ------------------------- -----------------------
  `DATABASE_URL`          `sqlite:///./airbnb.db`   Database connection
                                                    string.

  `ALLOWED_ORIGINS`       `http://localhost:3000`   Comma-separated list of
                                                    frontend origins
                                                    permitted by CORS.
  -------------------------------------------------------------------------

### 3. Start the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

Create `frontend/.env.local` using `frontend/.env.example` as a
reference:

``` env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:

``` bash
npm run dev
```

Open <http://localhost:3000> in your browser.

### Useful commands

  ----------------------------------------------------------------------------------
  Command                            Directory               Purpose
  ---------------------------------- ----------------------- -----------------------
  Delete `airbnb.db`, then restart   `backend/`              Recreates the demo
  the backend                                                database. This is
                                                             required after model
                                                             changes because the
                                                             project uses
                                                             `create_all` rather
                                                             than database
                                                             migrations.

  `python -m scripts.check_images`   `backend/`              Checks whether the
                                                             sample photo URLs are
                                                             reachable.

  `npm run lint`                     `frontend/`             Runs the frontend
                                                             linter.

  `npx tsc --noEmit`                 `frontend/`             Checks TypeScript types
                                                             without emitting files.

  `npm run build`                    `frontend/`             Creates a production
                                                             build.
  ----------------------------------------------------------------------------------

### Explore the demo

Authentication is simulated. The app starts with a default user, and the
profile menu provides **Switch user** to select another seeded account.
Users are labelled as hosts or guests.

-   **Guest workflow:** Search for "Goa", choose dates, open a listing,
    complete the demo reservation and checkout, then review the booking
    in **Trips**.
-   **Host workflow:** Switch to **Kabir Singh**, then choose **Switch
    to hosting** or **Manage listings** to view listings, dashboard
    statistics, reservations, and listing-management controls.

------------------------------------------------------------------------

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Rationale
  ----------------------- ----------------------- -----------------------
  **Frontend**            Next.js 16 (App         Provides file-based
                          Router), React 19,      routing and a typed
                          TypeScript              component model for the
                                                  marketplace interface.

  **Styling**             Tailwind CSS v4         Centralizes design
                                                  tokens in `globals.css`
                                                  and supports
                                                  class-based dark mode.

  **Maps**                Leaflet, React Leaflet, Provides interactive
                          OpenStreetMap tiles     maps without requiring
                                                  a paid API key.

  **UI utilities**        `lucide-react`,         Provides icons, toast
                          `sonner`, `date-fns`    notifications, and date
                                                  utilities.

  **Backend**             FastAPI (Python)        Exposes the application
                                                  API with request
                                                  validation and
                                                  automatic
                                                  OpenAPI/Swagger
                                                  documentation.

  **ORM**                 SQLAlchemy 2.0          Defines typed models,
                                                  relationships, eager
                                                  loading, and database
                                                  constraints.

  **Validation and        Pydantic v2,            Defines
  configuration**         `pydantic-settings`     request/response
                                                  schemas and loads
                                                  environment-based
                                                  settings.

  **Database**            SQLite                  Provides persistent
                                                  relational storage for
                                                  the assignment, with
                                                  foreign-key enforcement
                                                  and a trigger to reject
                                                  overlapping
                                                  reservations.

  **Deployment**          Vercel (frontend),      Separates frontend and
                          Railway (backend)       API deployment; the
                                                  backend uses a
                                                  persistent volume for
                                                  the SQLite database.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## System Design and Architecture

``` text
Browser (Next.js application)
        |
        | fetch() requests with X-User-Id header (mock authentication)
        v
FastAPI routers
        |  HTTP layer: parse requests, invoke services, return schemas
        v
Service layer
        |  Business rules: search, pricing, availability, booking, host CRUD
        v
SQLAlchemy models
        |
        v
SQLite database (airbnb.db)
```

### Backend Structure

Located in `backend/app`:

``` text
app/
├── main.py       Application setup, CORS, routers, table creation, and seeding
├── core/         Settings, mock-auth dependency, and shared constants
├── db/           Engine, sessions, database initialization, and seed data
├── models/       SQLAlchemy models for users, listings, bookings, reviews, wishlists, etc.
├── schemas/      Pydantic request and response models
├── services/     Business logic, organized by domain
└── routers/      HTTP endpoints, organized by resource
```

Key backend design decisions:

-   **Layered responsibilities:** Routers handle HTTP concerns and
    delegate business logic to services. Services are separated from
    request handling, making the code easier to review and test.
-   **Centralized mock authentication:** `get_current_user` reads
    `X-User-Id` and returns `401` when the header is missing or the user
    is unknown. Protected endpoints use this dependency, providing a
    single integration point for replacing demo authentication with JWT
    or session-based authentication.
-   **Ownership enforcement:** Host operations resolve listings through
    `get_owned_listing`, preventing one host from modifying another
    host's listings. Guests can access and cancel only their own
    bookings.
-   **Consistent pricing:** `services/pricing.py` is shared by quote
    generation, booking creation, and seed data. The service fee is
    calculated as 14% of the nightly subtotal.
-   **Query efficiency:** Listing searches eager-load photos with
    `selectinload`. Host dashboard statistics use grouped queries rather
    than issuing a separate statistics query for every listing.

### Frontend Structure

Located in `frontend/src`:

``` text
src/
├── app/          Pages and route segments
├── components/   Feature-oriented UI: layout, search, listings, booking, host, map, and UI
├── context/      Current user, wishlist, and theme contexts
├── hooks/        Search, price quote, scroll state, and click-outside hooks
└── lib/          API client, types, formatting, and URL/search helpers
```

The main routes include `/`, `/listings/[id]`, `/book/[id]`, `/trips`,
`/trips/[id]`, `/wishlists`, `/host`, `/host/listings/new`,
`/host/listings/[id]/edit`, and `/messages`.

Key frontend design decisions:

-   **URL-driven search state:** Location, dates, guest count, category,
    and filters are stored in query parameters. Search state therefore
    survives refreshes, browser navigation, and shared links.
-   **Shared API client:** `lib/api.ts` adds the user header and
    converts FastAPI errors---including `422` validation
    responses---into readable messages for forms and toast
    notifications.
-   **Reusable components:** Shared components include `Modal`
    (portal-rendered), `DateRangeCalendar`, `Counter`, and
    `ListingPhoto`, which falls back to a placeholder when an image URL
    fails.
-   **Responsive layouts:** Mobile layouts use a full-screen search
    sheet, bottom tab bar, photo slider, and bottom reservation bar.
    Desktop layouts use a search header that compacts on scroll and a
    sticky booking card.
-   **Theme initialization:** Dark mode is applied through a `dark`
    class on `<html>`, using a small pre-render script to reduce flashes
    of the wrong theme. Map tiles are styled to fit the selected theme.

------------------------------------------------------------------------

## Booking Concurrency and Availability

Preventing overlapping reservations requires more than an
application-level availability check: two concurrent requests could
otherwise both pass the check before either inserts a booking.

airbnb uses two safeguards:

1.  **Service-level validation:** Before creating a reservation,
    `booking_service` checks for confirmed bookings on the same listing
    with overlapping dates. If a conflict exists, the API returns
    `409 Conflict`.
2.  **Database trigger:** A SQLite `BEFORE INSERT/UPDATE` trigger
    repeats the overlap check at the database level. This provides a
    final guard when concurrent requests reach the insertion stage.

In a test with the service-level check disabled, 10 simultaneous
requests for the same dates resulted in one booking and nine rejections.

Booking intervals are **half-open**: check-in is included, while
check-out is excluded. A guest can therefore check out on the same date
that the next guest checks in.

------------------------------------------------------------------------

## Database Schema

The database contains **9 tables**. Monetary values are stored as
whole-number rupees to avoid floating-point rounding issues.

``` mermaid
erDiagram
    USERS ||--o{ LISTINGS : hosts
    USERS ||--o{ BOOKINGS : makes
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ WISHLIST_ITEMS : saves
    LISTINGS ||--o{ LISTING_IMAGES : has
    LISTINGS ||--o{ LISTING_BEDROOMS : has
    LISTINGS ||--o{ LISTING_AMENITIES : has
    AMENITIES ||--o{ LISTING_AMENITIES : "used by"
    LISTINGS ||--o{ BOOKINGS : receives
    LISTINGS ||--o{ REVIEWS : receives
    LISTINGS ||--o{ WISHLIST_ITEMS : "saved in"
    BOOKINGS ||--o| REVIEWS : "reviewed by"

    USERS {
        int id PK
        string name
        string email UK
        string avatar_url
        text bio
        bool is_superhost
        datetime created_at
    }
    LISTINGS {
        int id PK
        int host_id FK
        string title
        text description
        text space
        text guest_access
        text other_notes
        string property_type
        string category
        string city
        string state
        string country
        float latitude
        float longitude
        int price_per_night
        int cleaning_fee
        int max_guests
        int bedrooms
        int beds
        int bathrooms
        time check_in_time
        time checkout_time
        bool pets_allowed
        bool events_allowed
        bool smoking_allowed
        bool has_smoke_alarm
        bool has_co_alarm
        bool is_active
        datetime created_at
        datetime updated_at
    }
    LISTING_IMAGES {
        int id PK
        int listing_id FK
        string url
        int position
    }
    LISTING_BEDROOMS {
        int id PK
        int listing_id FK
        int position
        string beds
        string image_url
    }
    AMENITIES {
        int id PK
        string name UK
        string icon
    }
    LISTING_AMENITIES {
        int listing_id PK, FK
        int amenity_id PK, FK
    }
    BOOKINGS {
        int id PK
        int listing_id FK
        int guest_id FK
        date check_in
        date check_out
        int num_guests
        int nightly_price
        int cleaning_fee
        int service_fee
        int total_price
        string status
        datetime created_at
    }
    REVIEWS {
        int id PK
        int booking_id FK, UK
        int listing_id FK
        int author_id FK
        int rating
        text comment
        datetime created_at
    }
    WISHLIST_ITEMS {
        int user_id PK, FK
        int listing_id PK, FK
        datetime created_at
    }
```

### Schema Design Decisions

  -------------------------------------------------------------------------
  Decision                            Rationale
  ----------------------------------- -------------------------------------
  **A single `users` table for hosts  The same user can act as a guest and
  and guests**                        a host. Host capabilities are
                                      associated with owning listings.

  **Price snapshots on bookings**     The booking stores `nightly_price`,
                                      `cleaning_fee`, `service_fee`, and
                                      `total_price`, preserving the agreed
                                      price if the host later changes a
                                      listing's rate.

  **Soft deletion for listings**      `listings.is_active` hides a listing
                                      while retaining historical bookings,
                                      reviews, and earnings records.
                                      Upcoming bookings are cancelled when
                                      a listing is deactivated.

  **Computed ratings**                Listing ratings are calculated from
                                      reviews using grouped averages rather
                                      than stored separately, avoiding
                                      stale aggregate values.

  **One review per booking**          A unique constraint on
                                      `reviews.booking_id` prevents
                                      duplicate reviews for the same stay.
                                      Application rules restrict reviews to
                                      completed stays.

  **Composite primary keys**          `listing_amenities` and
                                      `wishlist_items` prevent duplicate
                                      associations at the database level.

  **Database constraints**            Check constraints validate positive
                                      nightly prices, guest counts, valid
                                      date ranges, ratings from 1--5, and
                                      allowed booking statuses.

  **Overlap trigger and index**       The trigger rejects conflicting
                                      reservations, while an index on
                                      `(listing_id, check_in, check_out)`
                                      supports availability queries.

  **Foreign-key enforcement**         `PRAGMA foreign_keys=ON` is applied
                                      to every connection because SQLite
                                      does not enforce foreign keys by
                                      default.

  **Cascading deletes**               Images, bedrooms, amenity links, and
                                      wishlist items are removed with their
                                      associated parent records where
                                      appropriate.

  **Separate image and bedroom        Position fields preserve gallery
  tables**                            order and allow listings to contain
                                      multiple bedrooms.
  -------------------------------------------------------------------------

### Seed Data

The database is seeded automatically when it is empty. A fixed random
seed makes the sample dataset reproducible. Booking dates are generated
relative to the current date so that the demo includes past stays with
reviews and upcoming reservations that block calendar dates.

  -----------------------------------------------------------------------
  Table                                                    Seeded records
  ------------------------------ ----------------------------------------
  Users                                            12 (6 hosts, 6 guests)

  Listings                              32 across 28 cities, 12 states, 7
                                         property types, and 8 categories

  Listing images                  195, with a unique cover photo for each
                                                                  listing

  Listing bedrooms                                                     67

  Amenities / listing-amenity                                    16 / 250
  associations                   

  Bookings                            212, including 66 upcoming bookings

  Reviews                                                             122

  Wishlist items                                                       21
  -----------------------------------------------------------------------

Nightly listing prices range from ₹2,600 to ₹18,500.

------------------------------------------------------------------------

## API Reference

**Local base URL:** `http://localhost:8000`\
**Interactive documentation:** [`/docs`](http://localhost:8000/docs)

Requests that operate on behalf of a user include the `X-User-Id: <id>`
header. This header is part of the demo authentication mechanism, not
production-grade authentication.

  ----------------------------------------------------------------------------------------
  Method          Endpoint                       Description           User required
  --------------- ------------------------------ --------------- -------------------------
  `GET`           `/api/health`                  Health check,              No
                                                 including a     
                                                 database ping.  

  `GET`           `/api/users`                   Lists users for            No
                                                 the Switch user 
                                                 menu.           

  `GET`           `/api/users/me`                Returns the                Yes
                                                 current user.   

  `GET`           `/api/listings`                Searches                   No
                                                 listings by     
                                                 location,       
                                                 dates, guests,  
                                                 category,       
                                                 property type,  
                                                 amenities,      
                                                 price, and      
                                                 pagination      
                                                 parameters.     

  `GET`           `/api/listings/filters`        Returns                    No
                                                 categories,     
                                                 property types, 
                                                 amenities, and  
                                                 price-range     
                                                 options.        

  `GET`           `/api/listings/{id}`           Returns listing            No
                                                 details,        
                                                 photos,         
                                                 bedrooms,       
                                                 amenities,      
                                                 host, reviews,  
                                                 rules, and      
                                                 booked date     
                                                 ranges.         

  `GET`           `/api/listings/{id}/quote`     Returns pricing            No
                                                 and             
                                                 availability    
                                                 for the         
                                                 requested dates 
                                                 and guest       
                                                 count.          

  `POST`          `/api/bookings`                Creates a                  Yes
                                                 booking         
                                                 (`201`);        
                                                 returns `409`   
                                                 if dates are no 
                                                 longer          
                                                 available.      

  `GET`           `/api/bookings/me`             Lists the                  Yes
                                                 current user's  
                                                 trips.          

  `GET`           `/api/bookings/{id}`           Returns a                  Yes
                                                 booking         
                                                 belonging to    
                                                 the current     
                                                 user.           

  `POST`          `/api/bookings/{id}/cancel`    Cancels an                 Yes
                                                 eligible        
                                                 upcoming trip.  

  `POST`          `/api/bookings/{id}/review`    Creates a                  Yes
                                                 review for a    
                                                 completed stay  
                                                 (`201`).        

  `GET`           `/api/host/listings`           Lists the                  Yes
                                                 host's          
                                                 properties with 
                                                 ratings,        
                                                 upcoming        
                                                 bookings, and   
                                                 earnings        
                                                 statistics.     

  `POST`          `/api/host/listings`           Creates a                  Yes
                                                 listing         
                                                 (`201`).        

  `GET`           `/api/host/listings/{id}`      Returns a                  Yes
                                                 listing's       
                                                 current values  
                                                 for the edit    
                                                 form.           

  `PUT`           `/api/host/listings/{id}`      Updates an                 Yes
                                                 owned listing.  

  `DELETE`        `/api/host/listings/{id}`      Deactivates a              Yes
                                                 listing and     
                                                 cancels its     
                                                 upcoming        
                                                 bookings.       

  `GET`           `/api/host/bookings`           Lists                      Yes
                                                 reservations    
                                                 for the host's  
                                                 listings, with  
                                                 optional        
                                                 `listing_id`    
                                                 and `when`      
                                                 filters.        

  `GET`           `/api/wishlist`                Lists the                  Yes
                                                 current user's  
                                                 saved listings. 

  `GET`           `/api/wishlist/ids`            Returns saved              Yes
                                                 listing IDs for 
                                                 wishlist        
                                                 controls.       

  `PUT`           `/api/wishlist/{listing_id}`   Saves a listing            Yes
                                                 (`204`;         
                                                 idempotent).    

  `DELETE`        `/api/wishlist/{listing_id}`   Removes a saved            Yes
                                                 listing (`204`; 
                                                 idempotent).    
  ----------------------------------------------------------------------------------------

### HTTP Status Codes

  -----------------------------------------------------------------------
                                      Code Meaning
  ---------------------------------------- ------------------------------
                                     `200` Request completed
                                           successfully.

                                     `201` Resource created.

                                     `204` Request completed with no
                                           response body.

                                     `400` A business rule prevents the
                                           action, such as cancelling a
                                           trip after it has started.

                                     `401` User header is missing or
                                           identifies an unknown user.

                                     `403` The action is forbidden.

                                     `404` Resource does not exist or is
                                           not accessible to the current
                                           user.

                                     `409` Reservation dates conflict
                                           with an existing booking.

                                     `422` Request validation failed;
                                           field-level details are
                                           returned.

                                     `503` Database is temporarily busy;
                                           retry the request.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Assumptions and Scope

-   **Authentication:** Authentication is mocked. The app starts with a
    default user and supports switching between seeded users. Requests
    identify the selected user through `X-User-Id`. A user can act as a
    host when they own a listing.
-   **Payments:** Checkout is simulated. The form validates input
    format, and card details are neither stored nor sent to a payment
    processor.
-   **Messaging, language, and currency:** These controls are
    placeholders marked as coming soon.
-   **Listing photos:** Hosts provide photo URLs. Cloud upload is not
    implemented.
-   **Demo data and media:** Listing images use stock photo URLs from
    [Unsplash](https://unsplash.com) under its applicable license.
    Profile images use generic placeholder avatars from `pravatar.cc`.
    Names, descriptions, bookings, reviews, and other sample records are
    fictional.
-   **Currency and geography:** Prices are represented as whole-number
    Indian rupees, and listings are located in India.
-   **Fees:** Hosts configure cleaning fees. The guest service fee is
    14% of the nightly subtotal. Taxes are not included.
-   **Cancellations:** Guests can cancel until the day before check-in
    for a full refund in the demo's business rules. Trips that have
    started cannot be cancelled.
-   **Booking confirmation:** Bookings are confirmed immediately without
    host approval. Hosts cannot book their own listings.
-   **Reviews:** Reviews are available only after completed stays, with
    one review permitted per booking.
-   **Dates:** Booking dates are treated as calendar dates without
    time-zone conversion. Check-in and check-out times are displayed as
    house rules.
-   **Sleeping arrangements:** The "Where you'll sleep" section is
    optional. If bedroom details are provided, each bedroom must be
    described.
-   **Location accuracy:** Hosts enter a city, state, and
    latitude/longitude. A quick-fill list of Indian cities is provided,
    and maps display an approximate area rather than an exact address.
-   **Schema changes:** Database migrations are not configured. After
    model changes, delete `airbnb.db` and restart the backend to create
    a fresh seeded database.

------------------------------------------------------------------------

## Challenges and Implementation Notes

-   **Reservation concurrency:** An application-level availability check
    can be affected by race conditions. A database trigger provides a
    second validation layer, and concurrent requests were tested with
    the service check disabled.
-   **Interface fidelity:** The UI recreates key marketplace patterns,
    including the search header that compacts on scroll, a two-month
    date-range picker with unavailable nights, and mobile-specific
    navigation and reservation controls.
-   **Shareable search state:** Query parameters preserve filters,
    dates, and pagination across refreshes and browser navigation.
-   **Theme consistency:** A pre-render theme script reduces flashes
    during dark-mode initialization, and map styling follows the active
    theme.
-   **SQLite deployment:** The deployed backend requires persistent
    storage so the database file survives redeployments. Railway is
    configured with a persistent volume for this purpose.

## Known Limitations

-   Authentication and authorization are simulated; anyone with access
    to the app can switch between seeded users.
-   Listing photos must be supplied as URLs. Broken URLs fall back to a
    placeholder.
-   Real payments, refunds, messaging, and host approval workflows are
    not implemented.
-   Database migrations (for example, Alembic) are not configured;
    schema changes require a fresh database.
-   There is no automated test suite yet. Verification has been
    performed manually using a checklist and ad hoc API scripts.
-   SQLite permits only one writer at a time, making it suitable for
    this demo but not an ideal choice for high-concurrency production
    workloads.
-   Free-tier hosting may suspend idle services, increasing latency for
    the first request after inactivity.

## Potential Improvements

-   Implement real sign-up and authentication using JWT or OAuth, with
    role and ownership checks enforced throughout the API.
-   Add cloud photo storage (for example, Cloudinary or Amazon S3) with
    drag-and-drop ordering.
-   Introduce guest-host messaging and booking requests that hosts can
    approve or decline.
-   Integrate a payment gateway in test mode, such as Razorpay or
    Stripe, with refund handling.
-   Support weekend and seasonal pricing, weekly discounts, and
    minimum-stay rules.
-   Add map-based search that updates results as the map moves, plus
    landmark-based search.
-   Migrate to PostgreSQL, add Alembic migrations, and implement
    automated API and end-to-end tests with pytest and Playwright.
