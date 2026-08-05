export type ID = string;

export type PropertyType =
  | 'EntireProperty'
  | 'Apartment'
  | 'House'
  | 'Duplex'
  | 'Studio'
  | 'SingleRoom'
  | 'SharedRoom'
  | 'Hostel'
  | 'StudentHousing'
  | 'HotelRoom'
  | 'Other';

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
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED' | 'ARCHIVED';
  /** Override for occupancy tag. Falls back to a seeded heuristic when missing. */
  occupancyStatus?: 'Occupied' | 'Vacant' | 'Draft';
  /** Hand-picked homes surfaced in the "Featured Homes" carousel. */
  featured?: boolean;
  host: {
    name: string;
    phone?: string;
    email?: string;
  };
  availabilityNote: string;
};

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export type PaymentIntent = {
  id: ID;
  bookingId: ID;
  amount: number;
  currency: 'USD' | 'NGN';
  status: 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'CANCELLED';
  createdAt: string;
};

export type PaymentTransaction = {
  id: ID;
  intentId: ID;
  bookingId: ID;
  amount: number;
  currency: 'USD' | 'NGN';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  method: 'Card' | 'Bank' | 'Wallet';
  reference: string;
  processedAt: string;
  fee: number;
  net: number;
};

export type Receipt = {
  id: ID;
  bookingId: ID;
  transactionId: ID;
  number: string;
  issuedAt: string;
  lineItems: { label: string; amount: number }[];
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: 'USD' | 'NGN';
  payer: string;
  recipient: string;
};

export type Refund = {
  id: ID;
  bookingId: ID;
  transactionId: ID;
  amount: number;
  currency: 'USD' | 'NGN';
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  reference: string;
  requestedAt: string;
  completedAt?: string;
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
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  receiptId?: string;
  refundId?: string;
};

export type UserProfile = {
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
  role: UserRole;
};
