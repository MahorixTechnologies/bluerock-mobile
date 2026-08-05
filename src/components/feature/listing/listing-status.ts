import type { Listing } from '@/lib/models';

export type HostTabKey = 'all' | 'active' | 'paused' | 'pending' | 'archived';

export const HOST_TAB_ORDER: readonly HostTabKey[] = [
  'all',
  'active',
  'paused',
  'pending',
  'archived',
] as const;

export const HOST_TAB_LABEL: Record<HostTabKey, string> = {
  all: 'All',
  active: 'Active',
  paused: 'Paused',
  pending: 'Pending',
  archived: 'Archived',
};

export type HostListingStatus = NonNullable<Listing['status']>;

export function matchesHostTab(
  tab: HostTabKey,
  status: Listing['status'],
): boolean {
  switch (tab) {
    case 'all':
      return true;
    case 'active':
      return status === 'APPROVED';
    case 'paused':
      return status === 'PAUSED';
    case 'pending':
      return status === 'PENDING' || status === 'REJECTED';
    case 'archived':
      return status === 'ARCHIVED';
  }
}

export function hostStatusDisplay(status: Listing['status']): string {
  switch (status) {
    case 'APPROVED':
      return 'Active';
    case 'PAUSED':
      return 'Paused';
    case 'PENDING':
      return 'Pending Review';
    case 'REJECTED':
      return 'Rejected';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return 'Pending Review';
  }
}

export type StatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export function hostStatusTone(status: Listing['status']): StatusTone {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PAUSED':
      return 'primary';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'ARCHIVED':
      return 'muted';
    default:
      return 'warning';
  }
}
