import { type Shift } from '@/types/shifts';

export const shifts: Shift[] = [
  {
    id: "1",
    venueId: "exchange-hotel",
    date: "2024-03-30",
    startTime: "18:00",
    endTime: "23:00",
    status: "OPEN",
    positions: 2,
    requirements: ["RSA Certificate", "Experience preferred"],
    hourlyRate: 45,
    description: "Evening bar service, busy night expected"
  },
  {
    id: "2", 
    venueId: "palace-hotel",
    date: "2024-03-31",
    startTime: "19:00",
    endTime: "00:00",
    status: "ASSIGNED",
    positions: 1,
    requirements: ["RSA Certificate"],
    hourlyRate: 50,
    description: "Weekend evening shift"
  },
  {
    id: "3",
    venueId: "recreation-hotel", 
    date: "2024-04-01",
    startTime: "17:00",
    endTime: "22:00",
    status: "OPEN",
    positions: 2,
    requirements: ["RSA Certificate", "1+ year experience"],
    hourlyRate: 48,
    description: "Public holiday evening shift"
  }
];