# BlueRock Mobile · AGENTS.md

> Living playbook for anyone — human or agent — working in `bluerock-mobile`.
> Stick to the patterns below; the codebase will stay consistent, builds will keep passing, and the UI will stay visually aligned with the rest of the BlueRock family.

---

## 1. Stack & Versions (read this first)

| Area | Package / Version |
|---|---|
| Framework | **Expo 56** with `expo-router 56.2.7` |
| React / RN | **React 19.2.3** · **React Native 0.85.3** |
| Language | **TypeScript 6.0.3** |
| Icons | `expo-symbols` (not `@expo/vector-icons` / Ionicons) |
| Data | **TanStack Query 5** via `providers/QueryProvider.tsx` |
| Storage | `expo-secure-store` (tokens) · `@react-native-async-storage/async-storage` (profile) |
| EAS Build | `eas.json` present · profiles: `development` / `preview` / `production` |

**Critical reminder:** Expo has changed significantly. Before writing navigation, tab-bar, routing, or platform-specific code, double-check the versioned docs at
https://docs.expo.dev/versions/v56.0.0/ — this codebase ships with Expo 56, not the API surfaces from training data.

---

## 2. Project Structure

```
bluerock-mobile/
├── app/                      # expo-router file-based routing
│   ├── (auth)/               # login, register, forgot-password (group, no tab nav)
│   ├── (tabs)/               # 5-tab bottom nav: Home, Search, Bookings, Payouts, Account
│   ├── listing/[id].tsx      # dynamic listing detail
│   └── _layout.tsx           # root layout (providers + safe area)
├── components/
│   ├── bookings/             # booking card, empty state, hero, highlight card
│   ├── home/                 # HomeFilterChips (curated categories), LandlordDashboard
│   ├── inputs/               # reusable Input, PasswordInput, SearchInput, Textarea
│   ├── Button.tsx            # shared primary button
│   ├── ListingCard.tsx       # `featured` | `list` variants
│   └── useColorScheme.ts     # light/dark hook
├── constants/
│   ├── theme.ts              # AppPalette tokens (bg, card, primary, soft, etc.)
│   └── Colors.ts             # legacy tab tint colors
├── hooks/
│   ├── useAppTheme.ts        # palette + isDark
│   ├── useListings.ts        # listings query (real API only)
│   └── useListing.ts         # single listing query (real API only)
├── lib/
│   ├── api-client.ts         # fetch wrapper: auto-prefix /api/v1 + bearer token + envelope unwrap
│   ├── format.ts             # formatMoney, etc.
│   ├── listing-mapper.ts     # map API Listing → client model
│   ├── models.ts             # UserProfile, Listing, Booking shared types
│   ├── storage.ts            # async-storage helpers
│   └── token-store.ts        # secure-store wrappers for JWT
└── providers/
    ├── AuthProvider.tsx      # login/register/logout → useAuth()
    ├── BookingProvider.tsx   # live bookings + optimistic create → useBookings()
    ├── QueryProvider.tsx     # React Query client
    └── SettingsProvider.tsx  # app settings
```

---

## 3. Routing Rules

- **Use `expo-router` and its conventions.** Do not add a custom navigation container.
- **Tabs live in `app/(tabs)/_layout.tsx`**. The visible tab set is role-dependent:

  **RENTER / signed out (4 tabs):**
  1. `index` → **Home** (title "Home"; search moved into a top-right icon button on this screen, linking to `/(tabs)/search`)
  2. `bookings` → **Bookings**
  3. `saved` → **Saved** (favorited listings, backed by `useFavorites()` / `FavoritesProvider`)
  4. `profile` → **Account**

  **LANDLORD (5 tabs):**
  1. `index` → **Dashboard** (title "Dashboard", renders `LandlordDashboard`)
  2. `host-listings` → **My Listings** (`tabBarLabel: "My Listings"`, Symbol `building.2.fill` / `apartment`)
  3. `host-bookings` → **Bookings** (`tabBarLabel: "Bookings"`, Symbol `person.2.fill` / `group`)
  4. `payouts` → **Payout**
  5. `profile` → **Account**

- `bookings` and `saved` tabs are hidden (`tabBarItemStyle.display = "none"`) when role is LANDLORD; `bookings` also contains an explicit `<Redirect>` to `/host-bookings` as a belt-and-suspenders guard for direct navigation.
- Vice-versa: `host-listings`, `host-bookings`, and `payouts` tabs are hidden from RENTER/signed-out users via the same `display: "none"` gate while still being registered for deep-link navigation. Do **not** add `href: null` to a tab that needs to be a real visible tab for either role — on web it drops the route out of `state.routes` entirely (not just the tab-bar button), which silently removes the tab for every role, not just the one it's meant to be hidden from.
- `search` is registered as a `Tabs.Screen` but always hidden from the tab bar (`display: "none"` for both roles) — it's reachable via the search icon on Home (renter) or via `Link`/`router.push('/(tabs)/search')` elsewhere (e.g. `LandlordDashboard`'s "Explore" link), not as a bottom-tab destination.
- Floating `FloatingTabBar` already respects `display: "none"` via `isHidden()` filter on `tabBarItemStyle`, so the per-role visible-tab count above holds.
- Dynamic segments live in the `app/` root (e.g. `app/listing/[id].tsx`), not inside `(tabs)`.
- Href typing: cast string templates with `as Href` from `expo-router`.

---

## 4. UI / Design System

### 4.1 Always use the palette

Every screen must pull colors from `useAppTheme()` → `palette`. **Do not hardcode colors inside `StyleSheet.create` except for immutable tokens (shadows, rare overlays).** Acceptable palette keys:

```
bg, card, text, muted, search, soft, iconBubble, border,
primary, onPrimary, primarySoft, field, placeholder,
danger, dangerSoft, success, successSoft, warning, warningSoft, shadow
```

For home-specific components that only need a subset, use `HomePalette` from `components/home/types.ts` (it is a subset of `AppPalette`).

### 4.2 Icons

Use `expo-symbols/SymbolView` for everything. Each icon call follows this pattern:

```tsx
<SymbolView
  name={{ ios: 'house.fill', android: 'home', web: 'home' } as any}
  size={20}
  tintColor={palette.primary}
  weight="semibold"
/>
```

### 4.3 Typography & Elevation

- Headings: `fontWeight: '800' | '900'`. Sizes: 20, 22, 26 for section/hero/screen headers.
- Body: 13–15 with `lineHeight: 18–22`.
- Eyebrow labels: 11 / `'800'` / `letterSpacing: 0.4` / `textTransform: 'uppercase'`.
- Cards use **24–28 radius**, `borderWidth: 1` with `palette.border`, soft shadow + `elevation: 2–3`.

### 4.4 Modularize after stability

Monolithic screens are a smell. Once a screen layout has settled, split it following the home/bookings pattern:

```
components/
└── <feature>/
    ├── types.ts
    ├── utils.ts          # date parsing, formatting, status helpers
    ├── FeatureHeader.tsx
    ├── FeatureEmptyState.tsx
    └── FeatureItem.tsx
```

The route file (`app/**/*.tsx`) then owns: auth gating, role redirects, data slicing, and composition only.

---

## 5. Data Layer Rules

### 5.1 API client

Always use `apiFetch(path, options?)` from `lib/api-client.ts`. It handles:
- base URL from `EXPO_PUBLIC_API_URL` (auto appends `/api/v1`)
- `Authorization: Bearer <jwt>` injection
- unwrapping the backend `{ success, data, message }` envelope
- throws on HTTP errors or `success: false`

### 5.2 No mock/demo fallbacks — surface real state instead

As of the 2026-08-30 demo-removal pass, this app has no mock data files and no
demo-login bypass. `EXPO_PUBLIC_API_URL` is required; every screen calls the
real backend and renders a real loading / error / empty state instead of
falling back to fabricated data.

- `useListings()`, `useListing()`, `useHostListings()` always call the real API and
  propagate `isLoading` / `isError` to the screen — they do not synthesize data.
- `BookingProvider` exposes `bookingsError` / `ownerBookingsError` for screens to
  render instead of silently swallowing fetch failures.
- When adding a new data hook or screen, do **not** add a mock/demo fallback.
  Design a real empty state (nothing yet) and a real error state (request failed)
  instead — see `app/(tabs)/index.tsx` and `app/(tabs)/bookings.tsx` for the pattern.

### 5.3 TanStack Query conventions

- Query keys are tuples: `['listings', params]`, `['booking', id]`.
- Providers live in `providers/`; screens only import the hook.

---

## 6. Authentication & Roles

### 6.1 Provider hierarchy

`app/_layout.tsx` → `QueryProvider` → `AuthProvider` → `BookingProvider` → `SettingsProvider`

### 6.2 Roles

| Role | Route gating |
|---|---|
| `RENTER` | default. Home (with search icon), bookings, saved, account. No payouts tab. |
| `LANDLORD` | redirect `/bookings` → `/host-bookings`, dashboard, my listings, bookings, payout, account. |
| `ADMIN` | web admin only. Mobile does not expose admin pages. |

`AuthProvider` requires `EXPO_PUBLIC_API_URL` to be set — every auth action (login, register,
password reset, profile update, landlord application) throws a clear "connect a server" error
if it is missing. There is no offline/demo login bypass.

### 6.3 Test credentials (from seed, also work in web)

```
admin@bluerock.com    / admin123     (ADMIN)
landlord@bluerock.com / landlord123  (LANDLORD)
renter@bluerock.com   / renter123    (RENTER)
```

---

## 7. Common Screen Patterns

### Home (`app/(tabs)/index.tsx`)
LANDLORD renders `LandlordDashboard` (unchanged operational dashboard, tab titled "Dashboard").
RENTER and signed-out guests both get the same simplified discovery screen — a title row ("Home"
+ a top-right search icon button linking to `/(tabs)/search`, since search is no longer a tab),
then:
- `HomeFilterChips` as a curated-category picker (`All listings` / `Featured` / `New this week`,
  not raw property types) — `Featured` filters on `listing.featured`, `New this week` filters on
  `listing.createdAt` within the last 7 days.
- A single `ListingCard` (`variant="list"`) feed of whatever the selected category resolves to.

**Important:** both hooks used for the feed (`useListings`, plus the `useMemo`s for location chips
and the filtered feed) must be called unconditionally, above the `if (isLandlord) return
<LandlordDashboard />` early return. This screen has twice regressed into a "Rendered fewer hooks
than expected" crash (React error boundary) from a hook being declared after that early return —
double-check hook order here specifically before touching this file.

### Bookings (`app/(tabs)/bookings.tsx`)
Landlords redirect to `/host-bookings`. Signed-out users get a login CTA. Signed-in renters see:
- hero summary stats (Upcoming / Nights / Spent)
- latest reservation highlight card
- `BookingListItem` cards with reliable `ItemSeparatorComponent` spacing

### Saved (`app/(tabs)/saved.tsx`)
Renter/signed-out-only tab. Backed by `useFavorites()` (`FavoritesProvider`, device-local
storage, works regardless of auth) filtered against `useListings()`. A separate standalone
screen, `app/saved-listings.tsx`, still exists as a push-with-back-button variant linked from
`search.tsx` and the Account shortcuts — the two are intentionally not merged.

### Listing Detail (`app/listing/[id].tsx`)
Use `useListing(id)` which falls back to `mock-data.ts`.

### Auth flows (`app/(auth)/*`)
Use shared inputs from `components/inputs/` and `TextField.tsx`.
- login → `POST /auth/login`
- register → `POST /auth/register` (role is `RENTER` by default)
- forgot-password → `POST /auth/forgot-password`

---

## 8. Running & Verifying

```bash
cd bluerock-mobile

# install
npm install

# start metro
npm run start

# verify types before merging UI changes
npx tsc --noEmit --pretty false
```

The de facto verification step after any screen refactor is:
1. run `npx tsc --noEmit --pretty false` — **must pass with 0 errors**
2. run `GetDiagnostics` on the specific files you touched

---

## 9. Things You Will NOT Do

- Do **not** introduce `@expo/vector-icons` / Ionicons / MaterialIcons. Use `expo-symbols`.
- Do **not** re-introduce a 6th visible tab or hide labels on some tabs while showing them on others.
- Do **not** hardcode `#2563eb` or any palette color in per-component stylesheets — use `palette.*`.
- Do **not** reintroduce mock/demo data files, a demo-login bypass, or a "Create Demo Booking"-style
  button. When the backend is unreachable or returns nothing, render a real loading/error/empty
  state — never fabricated data.
- Do **not** add comments inside code blocks unless explicitly requested. Write self-documenting names.

---

## 10. Environment

Create `.env` from `.env.example`:

```
EXPO_PUBLIC_API_URL=http://<your-computer-ip>:3000
```

⚠️ **The emulator/device cannot reach `localhost`** — use your LAN IP for `EXPO_PUBLIC_API_URL`.
