import type { Profile, Bus, Route, Schedule, Booking, Payment } from "./types"

// Demo data for the bus ticket system
export const demoProfiles: Profile[] = [
  {
    id: "demo-user-1",
    full_name: "Mohamed Kamara",
    phone_number: "+232 76 123 456",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "demo-user-2",
    full_name: "Fatima Sesay",
    phone_number: "+232 77 987 654",
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "demo-user-3",
    full_name: "Ibrahim Turay",
    phone_number: "+232 78 555 123",
    created_at: "2024-02-01T09:15:00Z",
    updated_at: "2024-02-01T09:15:00Z",
  },
]

export const demoBuses: Bus[] = [
  {
    id: "demo-bus-1",
    bus_number: "WF-001",
    capacity: 50,
    bus_type: "Luxury Coach",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-bus-2",
    bus_number: "WF-002",
    capacity: 45,
    bus_type: "Standard",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-bus-3",
    bus_number: "WF-003",
    capacity: 55,
    bus_type: "Express",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-bus-4",
    bus_number: "WF-004",
    capacity: 40,
    bus_type: "Standard",
    status: "maintenance",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export const demoRoutes: Route[] = [
  {
    id: "demo-route-1",
    origin: "Freetown",
    destination: "Bo",
    distance_km: 233,
    duration_hours: 4.5,
    base_price: 150000,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-route-2",
    origin: "Freetown",
    destination: "Kenema",
    distance_km: 300,
    duration_hours: 5.5,
    base_price: 180000,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-route-3",
    origin: "Bo",
    destination: "Kenema",
    distance_km: 85,
    duration_hours: 2.0,
    base_price: 80000,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-route-4",
    origin: "Freetown",
    destination: "Makeni",
    distance_km: 184,
    duration_hours: 3.5,
    base_price: 120000,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-route-5",
    origin: "Freetown",
    destination: "Kailahun",
    distance_km: 350,
    duration_hours: 6.0,
    base_price: 200000,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export const demoSchedules: Schedule[] = [
  {
    id: "demo-schedule-1",
    route_id: "demo-route-1",
    bus_id: "demo-bus-1",
    departure_time: "06:00:00",
    arrival_time: "10:30:00",
    days_of_week: ["monday", "wednesday", "friday"],
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    route: demoRoutes[0],
    bus: demoBuses[0],
  },
  {
    id: "demo-schedule-2",
    route_id: "demo-route-1",
    bus_id: "demo-bus-2",
    departure_time: "14:00:00",
    arrival_time: "18:30:00",
    days_of_week: ["tuesday", "thursday", "saturday"],
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    route: demoRoutes[0],
    bus: demoBuses[1],
  },
  {
    id: "demo-schedule-3",
    route_id: "demo-route-2",
    bus_id: "demo-bus-3",
    departure_time: "07:30:00",
    arrival_time: "13:00:00",
    days_of_week: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    route: demoRoutes[1],
    bus: demoBuses[2],
  },
  {
    id: "demo-schedule-4",
    route_id: "demo-route-3",
    bus_id: "demo-bus-2",
    departure_time: "09:00:00",
    arrival_time: "11:00:00",
    days_of_week: ["monday", "wednesday", "friday", "sunday"],
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    route: demoRoutes[2],
    bus: demoBuses[1],
  },
  {
    id: "demo-schedule-5",
    route_id: "demo-route-4",
    bus_id: "demo-bus-1",
    departure_time: "15:30:00",
    arrival_time: "19:00:00",
    days_of_week: ["tuesday", "thursday", "saturday"],
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    route: demoRoutes[3],
    bus: demoBuses[0],
  },
]

export const demoBookings: Booking[] = [
  {
    id: "demo-booking-1",
    user_id: "demo-user-1",
    schedule_id: "demo-schedule-1",
    travel_date: "2024-12-20",
    seat_numbers: [12, 13],
    passenger_names: ["Mohamed Kamara", "Aisha Kamara"],
    passenger_phones: ["+232 76 123 456", "+232 77 234 567"],
    total_amount: 300000,
    booking_reference: "WFB20241215001",
    payment_status: "paid",
    booking_status: "confirmed",
    qr_code: "WFB-1734567890123",
    created_at: "2024-12-15T10:30:00Z",
    updated_at: "2024-12-15T10:35:00Z",
    schedule: demoSchedules[0],
  },
  {
    id: "demo-booking-2",
    user_id: "demo-user-2",
    schedule_id: "demo-schedule-3",
    travel_date: "2024-12-18",
    seat_numbers: [5],
    passenger_names: ["Fatima Sesay"],
    passenger_phones: ["+232 77 987 654"],
    total_amount: 180000,
    booking_reference: "WFB20241216002",
    payment_status: "paid",
    booking_status: "completed",
    qr_code: "WFB-1734567890124",
    created_at: "2024-12-16T14:20:00Z",
    updated_at: "2024-12-18T07:45:00Z",
    schedule: demoSchedules[2],
  },
  {
    id: "demo-booking-3",
    user_id: "demo-user-1",
    schedule_id: "demo-schedule-4",
    travel_date: "2024-12-22",
    seat_numbers: [8, 9, 10],
    passenger_names: ["Ibrahim Turay", "Mariama Turay", "Sallieu Turay"],
    passenger_phones: ["+232 78 555 123", "+232 76 666 789", "+232 77 777 890"],
    total_amount: 240000,
    booking_reference: "WFB20241217003",
    payment_status: "pending",
    booking_status: "confirmed",
    qr_code: null,
    created_at: "2024-12-17T16:45:00Z",
    updated_at: "2024-12-17T16:45:00Z",
    schedule: demoSchedules[3],
  },
  {
    id: "demo-booking-4",
    user_id: "demo-user-3",
    schedule_id: "demo-schedule-2",
    travel_date: "2024-12-19",
    seat_numbers: [25],
    passenger_names: ["Ibrahim Turay"],
    passenger_phones: ["+232 78 555 123"],
    total_amount: 150000,
    booking_reference: "WFB20241218004",
    payment_status: "paid",
    booking_status: "confirmed",
    qr_code: "WFB-1734567890125",
    created_at: "2024-12-18T09:15:00Z",
    updated_at: "2024-12-18T09:20:00Z",
    schedule: demoSchedules[1],
  },
]

export const demoPayments: Payment[] = [
  {
    id: "demo-payment-1",
    booking_id: "demo-booking-1",
    amount: 300000,
    payment_method: "Orange Money",
    transaction_id: "OM-2024121501234",
    payment_status: "completed",
    created_at: "2024-12-15T10:35:00Z",
    updated_at: "2024-12-15T10:35:00Z",
  },
  {
    id: "demo-payment-2",
    booking_id: "demo-booking-2",
    amount: 180000,
    payment_method: "Africell Money",
    transaction_id: "AM-2024121601567",
    payment_status: "completed",
    created_at: "2024-12-16T14:25:00Z",
    updated_at: "2024-12-16T14:25:00Z",
  },
  {
    id: "demo-payment-3",
    booking_id: "demo-booking-3",
    amount: 240000,
    payment_method: "Bank Transfer",
    transaction_id: null,
    payment_status: "pending",
    created_at: "2024-12-17T16:50:00Z",
    updated_at: "2024-12-17T16:50:00Z",
  },
  {
    id: "demo-payment-4",
    booking_id: "demo-booking-4",
    amount: 150000,
    payment_method: "QMoney",
    transaction_id: "QM-2024121801890",
    payment_status: "completed",
    created_at: "2024-12-18T09:20:00Z",
    updated_at: "2024-12-18T09:20:00Z",
  },
]

// Helper functions for demo data
export const getDemoUser = (userId: string) => {
  return demoProfiles.find((profile) => profile.id === userId)
}

export const getDemoBookingsByUser = (userId: string) => {
  return demoBookings.filter((booking) => booking.user_id === userId)
}

export const getDemoBookingById = (bookingId: string) => {
  return demoBookings.find((booking) => booking.id === bookingId)
}

export const getDemoScheduleById = (scheduleId: string) => {
  return demoSchedules.find((schedule) => schedule.id === scheduleId)
}

export const getDemoRoutesByOriginDestination = (origin?: string, destination?: string) => {
  return demoRoutes.filter((route) => {
    if (origin && destination) {
      return route.origin === origin && route.destination === destination
    }
    if (origin) {
      return route.origin === origin
    }
    if (destination) {
      return route.destination === destination
    }
    return true
  })
}

export const getDemoSchedulesByDay = (dayOfWeek: string) => {
  return demoSchedules.filter(
    (schedule) => schedule.days_of_week.includes(dayOfWeek.toLowerCase()) && schedule.status === "active",
  )
}
