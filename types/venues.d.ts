import { type VENUES } from '@/lib/constants/venues';

export type Venue = typeof VENUES[number];
export type VenueId = Venue['id'];