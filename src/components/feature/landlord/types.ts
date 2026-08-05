import type { AppPalette } from '@/constants/theme';
import type { Listing } from '@/lib/models';

export type LandlordPalette = AppPalette;

export type LandlordStats = {
  totalProperties: number;
  occupied: number;
  vacant: number;
  monthlyRevenue: number;
  currency: Listing['currency'];
};

export type QuickActionKey = 'tenants' | 'maintenance' | 'payments' | 'messages';

export type QuickAction = {
  key: QuickActionKey;
  label: string;
  tintBg: string;
  tintIcon: string;
};

export type LandlordPropertyItem = {
  id: string;
  title: string;
  location: string;
  status: 'Occupied' | 'Vacant' | 'Draft';
  pricePerYear: number;
  currency: Listing['currency'];
  image: string;
};
