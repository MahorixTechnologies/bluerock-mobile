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
│   ├── home/                 # HomeHeader, strip, chips, sections, featured carousel
│   ├── inputs/               # reusable Input, PasswordInput, SearchInput, Textarea
│   ├── Button.tsx            # shared primary button
│   ├── ListingCard.tsx       # `featured` | `list` variants
│   └── useColorScheme.ts     # light/dark hook
├── constants/
│   ├── theme.ts              # AppPalette tokens (bg, card, primary, soft, etc.)
│   └── Colors.ts             # legacy tab tint colors
├── hooks/
│   ├── useAppTheme.ts        # palette + isDark
│   ├── useListings.ts        # listings query with filter + mock fallback
│   └── useListing.ts         # single listing query with mock fallback
├── lib/
│   ├── api-client.ts         # fetch wrapper: auto-prefix /api/v1 + bearer token + envelope unwrap
│   ├── format.ts             # formatMoney, etc.
│   ├── listing-mapper.ts     # map API Listing → client model
│   ├── mock-data.ts          # 10+ seed listings, always used as fallback
│   ├── mock-bookings.ts      # dev bookings fallback
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
- **Tabs live in `app/(tabs)/_layout.tsx`**. Exactly **5 visible tabs** are exposed:
  1. `index` → **Home**
  2. `search` → **Search**
  3. `bookings` → **Bookings**
  4. `payouts` → **Payouts**
  5. `profile` → **Account**
- Landlord-only screens `host-listings` and `host-bookings` are registered with `href: null` so they remain navigable but never show as tabs.
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

### 5.2 Mock fallbacks are mandatory

**UI must never be empty if the API is offline or missing.**

- `useListings()` and `useListing()` must fall back to `mockListings` when the API throws or returns 0 items.
- Booking flows should remain visible via local optimistic writes in `BookingProvider`.
- When adding a new data hook, follow the same pattern:
  1. try live API
  2. on missing / empty / error → return `mock-*.ts` data

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
| `RENTER` | default. Home, search, bookings, payouts (info only), account. |
| `LANDLORD` | redirect `/bookings` → `/host-bookings`, payouts active, host listings. |
| `ADMIN` | web admin only. Mobile does not expose admin pages. |

In `AuthProvider`, if `EXPO_PUBLIC_API_URL` is unset, login/register still succeed with a dev token so the app remains runnable offline.

### 6.3 Test credentials (from seed, also work in web)

```
admin@bluerock.com    / admin123     (ADMIN)
landlord@bluerock.com / landlord123  (LANDLORD)
renter@bluerock.com   / renter123    (RENTER)
```

---

## 7. Common Screen Patterns

### Home (`app/(tabs)/index.tsx`)
Delegates to `components/home/*` for:
- `HomeHeader` + greeting + avatar + summary
- Search bar (pressable → navigate to search)
- `HomeSummaryStrip` (stat tiles)
- `HomeFilterChips`
- Two `HomeListingSection`s with slices `[0,4]` and `[4,8]`

### Bookings (`app/(tabs)/bookings.tsx`)
Landlords redirect to `/host-bookings`. Signed-out users get a login CTA. Signed-in renters see:
- hero summary stats (Upcoming / Nights / Spent)
- latest reservation highlight card
- `BookingListItem` cards with reliable `ItemSeparatorComponent` spacing

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
- Do **not** ship data screens that blank out when the backend is not reachable; always fallback to mocks.
- Do **not** add comments inside code blocks unless explicitly requested. Write self-documenting names.

---

## 10. Environment

Create `.env` from `.env.example`:

```
EXPO_PUBLIC_API_URL=http://<your-computer-ip>:3000
```

⚠️ **The emulator/device cannot reach `localhost`** — use your LAN IP for `EXPO_PUBLIC_API_URL`.
