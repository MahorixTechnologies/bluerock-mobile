import type { Listing } from './models';

export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export function readNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string') as string[];
}

/**
 * Normalize a raw listing object from the API into the app's `Listing` shape.
 * `hostFallbackName` lets callers label the host differently (e.g. "You" when
 * viewing your own listings).
 */
export function mapApiListing(value: unknown, hostFallbackName = 'Host'): Listing {
  const data = asRecord(value);
  const owner = asRecord(data.owner);
  const type = readString(data.type) === 'House' ? 'House' : 'Apartment';
  const currency = readString(data.currency) === 'USD' ? 'USD' : 'NGN';

  return {
    id: readString(data.id),
    title: readString(data.title),
    description: typeof data.description === 'string' ? data.description : undefined,
    location: readString(data.location),
    pricePerNight: readNumber(data.pricePerNight),
    currency,
    rooms: readNumber(data.rooms),
    bathrooms: readNumber(data.bathrooms),
    type,
    images: readStringArray(data.images),
    amenities: readStringArray(data.amenities),
    rules: Array.isArray(data.rules) ? readStringArray(data.rules) : undefined,
    status:
      data.status === 'PENDING' || data.status === 'APPROVED' || data.status === 'REJECTED'
        ? data.status
        : undefined,
    featured: Boolean(data.featured ?? data.isFeatured),
    host: {
      name: readString(owner.name, hostFallbackName),
      phone: typeof owner.phone === 'string' ? owner.phone : undefined,
      email: typeof owner.email === 'string' ? owner.email : undefined,
    },
    availabilityNote: 'Availability depends on selected dates.',
  };
}
