import { type Venue } from "@/types/venues";

export const venues: Venue[] = [
  {
    id: "exchange-hotel",
    name: "The Exchange Hotel",
    address: "133 Hannan St, Kalgoorlie WA 6430",
    suburb: "Kalgoorlie",
    capacity: 350,
    amenities: [
      "Stage lighting",
      "Professional sound system",
      "Private dressing rooms",
      "Security staff",
      "VIP areas"
    ],
    rates: {
      weekday: 800,
      weekend: 1200,
      hourly: 150
    },
    description: "Historic hotel venue with modern facilities, perfect for premium entertainment events.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
    type: "Hotel & Bar"
  },
  {
    id: "palace-hotel",
    name: "Palace Hotel",
    address: "137 Hannan St, Kalgoorlie WA 6430",
    suburb: "Kalgoorlie",
    capacity: 280,
    amenities: [
      "Vintage bar",
      "Modern audio setup",
      "Changing facilities",
      "Air conditioning",
      "Bar service"
    ],
    rates: {
      weekday: 650,
      weekend: 950,
      hourly: 120
    },
    description: "Iconic heritage-listed venue combining classic charm with contemporary amenities.",
    imageUrl: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=800&auto=format&fit=crop&q=60",
    type: "Heritage Hotel"
  },
  {
    id: "recreation-hotel",
    name: "Recreation Hotel",
    address: "139 Burt St, Boulder WA 6432",
    suburb: "Boulder",
    capacity: 200,
    amenities: [
      "Performance stage",
      "LED lighting",
      "Private areas",
      "Full kitchen",
      "Outdoor space"
    ],
    rates: {
      weekday: 500,
      weekend: 800,
      hourly: 100
    },
    description: "Modern entertainment venue with versatile spaces and state-of-the-art facilities.",
    imageUrl: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&auto=format&fit=crop&q=60",
    type: "Entertainment Venue"
  },
  {
    id: "grand-hotel",
    name: "Grand Hotel",
    address: "185 Hannan St, Kalgoorlie WA 6430",
    suburb: "Kalgoorlie",
    capacity: 400,
    amenities: [
      "Multiple bars",
      "Premium sound system",
      "Luxury suites",
      "VIP lounge",
      "Security team"
    ],
    rates: {
      weekday: 1000,
      weekend: 1500,
      hourly: 180
    },
    description: "Upscale venue featuring premium facilities and sophisticated atmosphere.",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=60",
    type: "Luxury Hotel"
  },
  {
    id: "york-hotel",
    name: "York Hotel",
    address: "259 Hannan St, Kalgoorlie WA 6430",
    suburb: "Kalgoorlie",
    capacity: 250,
    amenities: [
      "Traditional bar",
      "Entertainment area",
      "Changing rooms",
      "Catering available",
      "Parking"
    ],
    rates: {
      weekday: 600,
      weekend: 900,
      hourly: 110
    },
    description: "Classic Australian pub venue with a welcoming atmosphere and great facilities.",
    imageUrl: "https://images.unsplash.com/photo-1537639622086-73570d45a9ec?w=800&auto=format&fit=crop&q=60",
    type: "Traditional Pub"
  }
];