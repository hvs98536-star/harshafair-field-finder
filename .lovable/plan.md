## Phase 2 — Discovery, Matching & Marketplace

### Database changes (one migration)
- Add to `crop_listings`: `is_organic boolean`, `price_numeric numeric`, `quantity_numeric numeric`, `unit text`.
- Add to `buyer_requests`: `price_numeric numeric`, `quantity_numeric numeric`, `unit text`.
- Add to `profiles`: `is_verified boolean`, `bio text`.
- New table `favorites` (user_id, item_type 'listing'|'request', item_id, created_at) with RLS (user can CRUD own).
- Indexes on crop_name, location, price_numeric, created_at.

### New routes
- `/listings/$id` — detail page for a crop listing: image gallery, farmer profile preview (verified badge, completion %), location, contact buttons, related matches (same crop or nearby).
- `/requests/$id` — detail page for buyer request: same structure.
- `/favorites` — list of saved listings + requests, plus recently viewed (localStorage-backed).

### Dashboard upgrades
- Filter bar component used by both farmer & buyer feeds:
  - Search text, crop chip filter, location, price min/max, quantity min/max, organic toggle, sort (recent / price asc / price desc).
- Server-side filtering via supabase queries (range/eq/order); client-side fallback for chips.
- Smart match scoring: weight crop name (50), location match (25), quantity overlap (15), price proximity (10) → "Match X%" badge on recommended cards.
- Add Favorite (heart) button on every card, persists to `favorites` table.
- Track recently viewed in localStorage when opening a detail page.

### Listing/Request forms
- Add `is_organic` checkbox (listings) and structured numeric price/quantity + unit dropdown (kg/ton/quintal). Keep existing free-text fields displayed.

### Trust & profile
- Verified badge component (shield icon) shown next to names when `is_verified`.
- Profile completion % calculated from filled profile fields, shown in dashboard header and detail pages.
- Trust badges: farmer ("Verified Farmer") / buyer ("Trusted Buyer") rendered conditionally.

### UI polish
- Skeleton loaders for cards (replace generic spinner during refresh).
- Framer-motion fade/slide on grids and detail page sections.
- Improved empty states with illustrative emoji + CTA button.
- Card hover lift + image zoom transitions.

### Files to create
- `src/components/FilterBar.tsx`
- `src/components/CardSkeleton.tsx`
- `src/components/VerifiedBadge.tsx`
- `src/components/ProfileCompleteness.tsx`
- `src/components/FavoriteButton.tsx`
- `src/components/MatchScore.tsx` + `src/lib/matching.ts`
- `src/lib/recentlyViewed.ts`
- `src/routes/listings.$id.tsx`
- `src/routes/requests.$id.tsx`
- `src/routes/favorites.tsx`

### Files to update
- `src/routes/dashboard.tsx` — integrate filter bar, favorites, match scores, skeletons, link cards to detail pages, organic + numeric fields in forms.
- `src/components/Navbar.tsx` — add Favorites link when signed in.
- One supabase migration file.

### Out of scope
Realtime notifications, in-app messaging (kept for Phase 3).
