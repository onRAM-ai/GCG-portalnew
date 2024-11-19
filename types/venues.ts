export interface Venue {
  id: string;
  name: string;
  address: string;
  suburb: string;
  capacity: number;
  amenities: string[];
  rates: {
    weekday: number;
    weekend: number;
    hourly: number;
  };
  description: string;
  imageUrl: string;
  type: string;
}