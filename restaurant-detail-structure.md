# Restaurant Detail Page - Architecture Diagram
 
## Page Layout Structure
 
### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│                         NAVBAR (existing)                         │
├──────────┬──────────────────────────────┬───────────────────────┤
│          │                              │                       │
│ SIDEBAR  │ MAIN CONTENT                 │ RIGHT PANEL (sticky)  │
│ (sticky) │                              │                       │
│          │  ┌────────────────────────┐  │ ┌─────────────────────┤
│          │  │   HERO SECTION         │  │ │ LOCATION MAP        │
│ Category │  │ ┌────────────────────┐ │  │ │ (sticky at top-24)  │
│ Chips    │  │ │ Brand Card + Info  │ │  │ │                     │
│          │  │ └────────────────────┘ │  │ │                     │
│          │  │ ┌────────────────────┐ │  │ │                     │
│ (Icons + │  │ │ Image Carousel     │ │  │ │                     │
│  Labels) │  │ │ (Vertical scroll)  │ │  │ │                     │
│          │  │ └────────────────────┘ │  │ │                     │
│          │  └────────────────────────┘  │ │                     │
│          │                              │ │                     │
│          │  ┌────────────────────────┐  │ │                     │
│ [Special │  │ VOUCHER SECTION        │  │ │                     │
│  Offers] │  │ [Promo Card 1] [Promo] │  │ │                     │
│          │  └────────────────────────┘  │ │                     │
│          │                              │ └─────────────────────┤
│ [Breakfs │  ┌────────────────────────┐  │
│  t]      │  │ MENU SECTIONS          │  │
│          │  │ ─────────────────────  │  │
│ [Coffee] │  │ 🌅 Breakfast           │  │
│          │  │ ┌──────┬──────┬───────┐│  │
│ [Healthy]│  │ │Card1 │Card2 │Card3  ││  │
│          │  │ │      │      │Card4  ││  │
│ [Noodles]│  │ └──────┴──────┴───────┘│  │
│          │  │                        │  │
│ [Drinks] │  │ ☕ Coffee & Tea       │  │
│          │  │ ┌──────┬──────┬───────┐│  │
│          │  │ │Card5 │Card6 │Card7  ││  │
│          │  │ └──────┴──────┴───────┘│  │
│          │  │                        │  │
│          │  │ 🥗 Healthy Foods      │  │
│          │  │ ┌──────┬──────┬───────┐│  │
│          │  │ │Card8 │Card9 │Card10 ││  │
│          │  │ └──────┴──────┴───────┘│  │
│          │  └────────────────────────┘  │
└──────────┴──────────────────────────────┴───────────────────────┘
```
 
### Mobile (<768px)
```
┌────────────────────────────────┐
│      NAVBAR (existing)         │
├────────────────────────────────┤
│                                │
│  ◀ Back Button                │
│                                │
│  ┌──────────────────────────┐ │
│  │ HERO SECTION             │ │
│  │ ┌──────────────────────┐ │ │
│  │ │ Brand Card           │ │ │
│  │ │ (full width)         │ │ │
│  │ └──────────────────────┘ │ │
│  │ ┌──────────────────────┐ │ │
│  │ │ Image Carousel       │ │ │
│  │ │ (horizontal swipe)   │ │ │
│  │ │                      │ │ │
│  │ │ ● ○ ○  (indicators) │ │ │
│  │ └──────────────────────┘ │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ PROMO VOUCHERS           │ │
│  │ ┌──────────────────────┐ │ │
│  │ │ 20% off Promo        │ │ │
│  │ └──────────────────────┘ │ │
│  │ ┌──────────────────────┐ │ │
│  │ │ $3 Delivery Discount │ │ │
│  │ └──────────────────────┘ │ │
│  └──────────────────────────┘ │
│                                │
│  CATEGORY CHIPS (horizontal)  │
│  [Special] [Breakfast] ...    │
│                                │
│  ┌──────────────────────────┐ │
│  │ MENU SECTIONS            │ │
│  │                          │ │
│  │ 🌅 Breakfast            │ │
│  │ ┌─────────┬─────────────┤ │
│  │ │  Card1  │   Card2     │ │
│  │ ├─────────┼─────────────┤ │
│  │ │  Card3  │   Card4     │ │
│  │ └─────────┴─────────────┘ │
│  │                          │ │
│  │ ☕ Coffee & Tea         │ │
│  │ ┌─────────┬─────────────┤ │
│  │ │  Card5  │   Card6     │ │
│  │ ├─────────┼─────────────┤ │
│  │ │  Card7  │   Card8     │ │
│  │ └─────────┴─────────────┘ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ LOCATION MAP             │ │
│  │ 📍 Show Map              │ │
│  │ (toggle on click)        │ │
│  │                          │ │
│  │ Address + Get Directions │ │
│  └──────────────────────────┘ │
└────────────────────────────────┘
```
 
---
 
## Component Hierarchy
 
```
RestaurantDetailPage (src/app/restaurant/[id]/page.tsx)
│
├── Header
│   └── Back Button (Link)
│
├── Main Grid (3 columns on desktop, 1 on mobile)
│   │
│   ├── LEFT COLUMN
│   │   └── RestaurantCategorySidebar
│   │       └── Maps category.key to CategoryIcon
│   │           ├── Desktop: sticky vertical rail
│   │           └── Mobile: horizontal chip row
│   │
│   ├── CENTER COLUMN
│   │   ├── RestaurantHero
│   │   │   ├── Brand Card
│   │   │   │   ├── Logo + Name
│   │   │   │   ├── Rating badge
│   │   │   │   ├── Delivery time
│   │   │   │   └── Open/closed status
│   │   │   │
│   │   │   └── Image Carousel
│   │   │       ├── Embla Carousel (vertical on desktop)
│   │   │       ├── Hero Slides from RestaurantDetail
│   │   │       └── Indicators (mobile)
│   │   │
│   │   ├── Promo Section (if vouchers exist)
│   │   │   └── VoucherCard (repeating)
│   │   │       └── Displays discount, min spend, expiry
│   │   │
│   │   └── Menu Sections (map over categories)
│   │       └── RestaurantMenuSection (repeating)
│   │           ├── Section heading (icon + label)
│   │           └── Grid of MenuItemCard
│   │               ├── Image (with discount badge)
│   │               ├── Name + rating + time + distance
│   │               └── Price (with strikethrough if on sale)
│   │
│   └── RIGHT COLUMN
│       └── RestaurantLocationMap
│           ├── Google Maps iframe
│           ├── Address info
│           └── Get Directions link
│
└── Footer (existing)
```
 
---
 
## Data Flow
 
```
┌─ USER NAVIGATES TO /restaurant/1
│
├─ src/app/restaurant/[id]/page.tsx
│   │
│   └─ useGetRestaurantByIdQuery(id)  ◄── RTK Query Hook
│       │
│       └─ restaurantApi (src/app/store/restaurantApi.ts)
│           │
│           └─ Fetches from: public/data/restaurantDetail.json
│               │
│               └─ Returns: RestaurantDetail type
│                   ├── id, name, logo, brandColor
│                   ├── heroSlides: HeroSlide[]
│                   ├── vouchers: PromoVoucher[]
│                   └── categories: RestaurantMenuCategory[]
│                       └── items: MenuItem[]
│
└─ Components render with fetched data
    │
    ├── RestaurantHero displays
    │   └── brandColor, logo, heroSlides
    │
    ├── VoucherCard displays
    │   └── Each voucher from vouchers[]
    │
    └── RestaurantMenuSection displays
        └── Each category + its items
```
 
---
 
## Responsive Breakpoints
 
```
Mobile First Approach:
├── Default (< 576px)     Mobile-optimized
│   ├── Hero: 1 column (brand stacked on carousel)
│   ├── Cards: 2-column grid
│   ├── Sidebar: hidden (use chip row instead)
│   └── Map: toggleable button
│
├── SM (≥ 576px)          Large phones
│   ├── Hero: still 1 column
│   └── Cards: 2-column
│
├── MD (≥ 768px)          Tablets
│   ├── Hero: 2-column grid
│   ├── Cards: 3-column grid
│   ├── Sidebar: optional stack
│   └── Map: starts showing
│
├── LG (≥ 1024px)         Desktops
│   ├── Hero: 2-column (brand | carousel vertical)
│   ├── Layout: 3-column (sidebar | content | map)
│   ├── Cards: 4-column grid
│   ├── Sidebar: sticky vertical rail
│   ├── Carousel: vertical (scroll with arrows)
│   └── Map: sticky on right
│
└── XL (≥ 1280px)         Large desktops
    └── Spacing increases, content max-width applied
```
 
---
 
## Font System
 
```
Google Sans (Self-Hosted)
│
├── Variable Font File
│   ├── GoogleSans-VariableFont.ttf
│   │   └── Supports: weight 400–700, normal style
│   │
│   └── GoogleSans-Italic-VariableFont.ttf
│       └── Supports: weight 400–700, italic style
│
├── Loader (src/lib/fonts.ts)
│   └── next/font/local registers both files
│       └── Exports CSS variable: --font-google-sans
│
├── Used in (src/app/layout.tsx)
│   └── Applied to: <html> className
│       └── Flows down to all elements via * selector
│
└── Fallback chain (src/app/globals.css)
    └── font-family: var(--font-google-sans), ui-sans-serif, system-ui
```
 
---
 
## State Management Flow
 
```
src/app/restaurant/[id]/page.tsx (Client Component)
│
├── Hook: useGetRestaurantByIdQuery(id)
│   │   ← RTK Query caching & refetching
│   │
│   └─ Destructures:
│       ├── data: RestaurantDetail
│       ├── isLoading: boolean
│       └── isError: boolean
│
├── Conditional Rendering:
│   ├── isLoading → Show "Loading..." spinner
│   ├── isError → Show "Not found" error state
│   └── data → Render full page
│
└── Local State (in components):
    ├── RestaurantCategorySidebar
    │   └── activeKey (highlights current section)
    │
    └── RestaurantHero
        └── selected (carousel current slide)
```
 
---
 
## Type System
 
```
restaurant.ts (main types)
├── RestaurantDetail
│   ├── id: number
│   ├── name: string
│   ├── brandColor: string (hex)
│   ├── logo: string
│   ├── heroSlides: HeroSlide[]
│   ├── rating: number
│   ├── vouchers: PromoVoucher[]
│   └── categories: RestaurantMenuCategory[]
│
├── RestaurantMenuCategory
│   ├── key: string (for scroll anchor)
│   ├── label: string (Khmer text)
│   ├── icon: string (maps to icon name)
│   └── items: MenuItem[]
│
├── MenuItem
│   ├── id: number
│   ├── name: string
│   ├── image: string
│   ├── price: number
│   ├── originalPrice?: number (if on sale)
│   ├── rating: number
│   ├── etaMinutes: number
│   ├── distanceKm: number
│   └── isHalal?: boolean
│
├── PromoVoucher
│   ├── id: number
│   ├── title: string
│   ├── discountLabel: string ("20%", "$3")
│   ├── minSpend: number
│   └── expiresAt: string (ISO date)
│
└── HeroSlide
    ├── id: number
    ├── image: string
    └── alt: string
```
 
---
 
## API/Data Layer
 
```
RTK Query Setup (src/app/store/)
│
├── baseApi.ts
│   ├── createApi(baseQuery: fetch)
│   ├── tagTypes: ["Food", "Restaurant"]
│   └── endpoints injected by slices
│
└── restaurantApi.ts
    ├── getRestaurants() → RestaurantDetail[]
    │   └── Query: /data/restaurantDetail.json
    │
    └── getRestaurantById(id: number) → RestaurantDetail | undefined
        ├── Query: /data/restaurantDetail.json
        ├── Transform: filter to single match
        └── Tag: { type: "Restaurant", id }
```
 
**Migration to Real API:**
Replace the `query()` function:
```javascript
// Current (static JSON):
query: () => "/data/restaurantDetail.json"
 
// Future (real backend):
query: (id) => `/api/restaurants/${id}`
```
 
---
 
## Styling Approach
 
```
Tailwind CSS (utility-first)
│
├── Breakpoint Usage:
│   ├── Default: mobile (no prefix)
│   ├── sm: > 640px
│   ├── md: > 768px
│   ├── lg: > 1024px
│   └── xl: > 1280px
│
├── Color Tokens (from tailwind.config.ts):
│   ├── primary-50 to primary-950 (green)
│   ├── secondary-50 to secondary-950 (orange)
│   ├── accent-* (yellow)
│   └── gray-* (neutral)
│
├── Spacing:
│   ├── gap-4 (16px gaps between elements)
│   ├── p-6 sm:p-8 (responsive padding)
│   └── mt-8 mb-6 (vertical rhythm)
│
└── Rounded Corners:
    ├── rounded-[32px] (hero card)
    ├── rounded-[24px] (menu cards)
    ├── rounded-[14px] (images)
    └── rounded-full (badges)
```
 
No CSS modules, no styled-components — all Tailwind utilities in className strings.
 
---
 
## Performance Considerations
 
```
✅ Optimizations Included:
 
1. Image Optimization
   ├── Next.js <Image> component
   ├── Priority props on hero slides
   └── Responsive sizes attribute
 
2. Font Loading
   ├── Self-hosted (no external request)
   ├── font-display: swap
   └── Preload: true
 
3. RTK Query Caching
   ├── Automatic request deduplication
   ├── Cache invalidation via tags
   └── Stale data refresh
 
4. Lazy Loading
   ├── Carousel items load on-demand
   └── Code splitting per route
 
5. Responsive Images
   ├── Different sizes per breakpoint
   └── Prevents unnecessary downloads
```
 
---
 
This architecture is:
- **Scalable** - Easy to add more features (reviews, chat, etc.)
- **Maintainable** - Clear component responsibilities
- **Testable** - Each component has single concern
- **Type-safe** - Full TypeScript coverage
- **Accessible** - Semantic HTML, ARIA labels
- **Performant** - Optimized for web vitals

## 📁 File Locations
All files go in their proper directories:

your-project/
├── src/
│   ├── app/
│   │   ├── restaurant/[id]/page.tsx       ← NEW PAGE ROUTE
│   │   ├── layout.tsx                     ← UPDATED (fonts)
│   │   ├── globals.css                    ← UPDATED (fonts)
│   │   ├── types/
│   │   │   ├── restaurant.ts              ← NEW
│   │   │   └── food.ts                    ← UPDATED
│   │   └── store/
│   │       ├── restaurantApi.ts           ← NEW
│   │       └── baseApi.ts                 ← UPDATED
│   ├── components/
│   │   ├── restaurant/                    ← NEW FOLDER
│   │   │   ├── categoryIcons.tsx
│   │   │   ├── RestaurantCategorySidebar.tsx
│   │   │   ├── RestaurantHero.tsx
│   │   │   ├── RestaurantLocationMap.tsx
│   │   │   ├── VoucherCard.tsx
│   │   │   ├── MenuItemCard.tsx
│   │   │   └── RestaurantMenuSection.tsx
│   │   └── FoodCardComponent.tsx           ← UPDATED
│   ├── lib/
│   │   └── fonts.ts                       ← NEW
│   └── assets/fonts/google-sans/          ← NEW FOLDER
│       ├── GoogleSans-VariableFont.ttf
│       ├── GoogleSans-Italic-VariableFont.ttf
│       └── OFL.txt
└── public/
    └── data/
        ├── restaurantDetail.json          ← NEW
        └── recommendedFoods.json 