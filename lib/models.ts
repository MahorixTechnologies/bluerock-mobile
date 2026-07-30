export type ID = string;

export type PropertyType = 'House' | 'Apartment';

export type UserRole = 'RENTER' | 'LANDLORD' | 'ADMIN';

export type Listing = {
  id: ID;
  title: string;
  description?: string;
  location: string;
  pricePerNight: number;
  currency: 'USD' | 'NGN';
  rooms: number;
  bathrooms: number;
  type: PropertyType;
  images: string[];
  amenities: string[];
  rules?: string[];
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  /** Hand-picked homes surfaced in the "Featured Homes" carousel. */
  featured?: boolean;
  host: {
    name: string;
    phone?: string;
    email?: string;
  };
  availabilityNote: string;
};

export type Booking = {
  id: ID;
  listingId: ID;
  listingTitle: string;
  location: string;
  currency: 'USD' | 'NGN';
  startDate: string;
  endDate: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  createdAt: string;
};

export type UserProfile = {
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
  role: UserRole;
};
