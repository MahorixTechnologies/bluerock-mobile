````markdown
# BlueRock Mobile Codebase Cleanup & Component Organization Specification

## Overview

Refactor and reorganize the `bluerock-mobile` codebase to improve maintainability, consistency, scalability, and developer experience.

The goal is to establish a clear separation between reusable UI components, feature-specific components, hooks, utilities, and shared logic.

This refactor **must not introduce breaking functionality**. Existing behavior should remain unchanged.

---

# Objective

The AI should:

- Clean the project structure
- Move files into their appropriate folders
- Remove duplicate components
- Improve naming consistency
- Reduce coupling between features
- Improve code discoverability
- Preserve existing functionality

---

# Scope

Work only within:

```
bluerock-mobile/
```

Do not modify:

- Backend
- Web
- Admin

unless required for imports or shared packages.

---

# Folder Structure

Refactor the project to follow this structure.

```
src/

├── components/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   ├── feedback/
│   ├── navigation/
│   └── feature/
│
├── screens/
│
├── hooks/
│
├── services/
│
├── api/
│
├── store/
│
├── providers/
│
├── constants/
│
├── utils/
│
├── lib/
│
├── theme/
│
├── types/
│
├── assets/
│
└── navigation/
```

---

# Component Organization

## components/ui

Contains reusable UI primitives.

Examples:

```
Button

Input

TextField

Textarea

Select

Checkbox

Radio

Switch

Badge

Chip

Avatar

Icon

Divider

Card

Modal

BottomSheet

Toast

Spinner

Skeleton

EmptyState

ErrorState

LoadingOverlay

ProgressBar

SearchInput
```

These components should contain **no business logic**.

---

## components/common

Contains reusable application components.

Examples:

```
Header

Footer

PageHeader

Section

ListItem

SearchBar

EmptyList

AvatarGroup

PropertyCard

RoomCard

PriceTag

Rating

LocationTag

ImageGallery

ImagePicker
```

Reusable across multiple features.

---

## components/layout

Contains layout components.

Examples:

```
Screen

Container

SafeArea

Stack

Row

Column

Spacer

Grid

KeyboardAvoidingContainer

ScrollContainer
```

---

## components/feedback

Examples:

```
Alert

Banner

Snackbar

Toast

Loading

ErrorView

OfflineBanner

RetryView
```

---

## components/navigation

Examples:

```
TabBar

BottomNavigation

DrawerHeader

NavigationHeader

BackButton
```

---

## components/feature

Feature-specific reusable components.

Example:

```
booking/

listing/

auth/

profile/

payments/
```

These are shared within a feature only.

---

# Screen Components

Each screen should own its local components.

Example:

```
screens/

ListingDetails/

    index.tsx

    components/

        Gallery.tsx

        Amenities.tsx

        HostCard.tsx

        PriceCard.tsx

        BookingCard.tsx
```

These components should not be placed inside the global components folder unless reused elsewhere.

---

# Hooks

Move reusable hooks into:

```
hooks/
```

Examples:

```
useAuth

useBooking

useListings

useDebounce

useModal

useBottomSheet

usePermissions

usePagination

useSearch

useCurrentLocation

useKeyboard

useInfiniteScroll

useTheme
```

Hooks should:

- Be reusable
- Contain no UI
- Follow React Hook conventions

---

# Utilities

Move helper functions into:

```
utils/
```

Examples:

```
formatCurrency

formatDate

calculateDistance

truncate

validators

stringHelpers

numberHelpers
```

Utilities should be pure functions.

---

# Services

Move business services into:

```
services/
```

Examples:

```
AuthService

BookingService

ListingService

PaymentService

NotificationService
```

---

# API

Move API clients into:

```
api/
```

Examples:

```
client.ts

auth.ts

bookings.ts

listings.ts

payments.ts
```

---

# Providers

Move providers into:

```
providers/
```

Examples:

```
AuthProvider

ThemeProvider

ModalProvider

QueryProvider

LocationProvider
```

---

# Theme

Organize theme files.

```
theme/

colors.ts

spacing.ts

typography.ts

radius.ts

shadows.ts

index.ts
```

---

# Types

Move reusable types into:

```
types/
```

Examples:

```
booking.ts

listing.ts

auth.ts

navigation.ts
```

Prefer shared types from `packages/shared` where applicable.

Do not duplicate interfaces.

---

# Barrel Exports

Add `index.ts` files where appropriate.

Example:

```
components/ui/index.ts

components/common/index.ts

hooks/index.ts
```

Simplify imports throughout the project.

---

# Naming Conventions

Use:

```
PascalCase

for

Components
```

Use:

```
camelCase

for

hooks

utilities

functions
```

Examples:

```
Button.tsx

PropertyCard.tsx

useListings.ts

formatCurrency.ts
```

---

# Cleanup

The AI should:

- Remove unused files
- Remove dead code
- Remove duplicate components
- Remove duplicate hooks
- Remove duplicate utilities
- Remove unused exports
- Remove unused imports
- Remove commented-out code
- Remove obsolete folders

---

# Imports

Replace deep relative imports where possible.

Prefer project aliases.

Example:

```
@/components/ui

@/hooks

@/utils
```

Maintain consistent import ordering throughout the project.

---

# Refactoring Rules

The AI must:

- Preserve existing functionality
- Preserve public APIs where possible
- Avoid unnecessary rewrites
- Reuse existing components
- Avoid creating duplicate implementations
- Move files instead of recreating them when appropriate
- Update imports after moving files

---

# Validation

After refactoring:

- The application should build successfully.
- There should be no broken imports.
- There should be no duplicate components.
- Existing screens should continue to function correctly.
- Linting should pass.
- TypeScript errors should not increase.

---

# Deliverables

The AI should provide:

1. Updated folder structure
2. Moved files
3. Updated imports
4. Removed duplicate code
5. Removed unused files
6. Summary of changes
7. List of files moved
8. List of deleted files (if any)
9. Any recommendations for further cleanup

---

# Acceptance Criteria

- Clear separation between reusable UI components and feature-specific components.
- Every screen owns its private components where appropriate.
- Global components contain only reusable elements.
- Hooks, utilities, services, providers, and theme files are organized consistently.
- Imports are simplified and standardized.
- No duplicate logic exists.
- No functionality is broken.
- The codebase is easier to navigate and maintain.
```
````
