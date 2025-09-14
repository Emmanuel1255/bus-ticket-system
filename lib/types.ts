export interface Profile {
  id: string
  full_name: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
}

export interface Bus {
  id: string
  bus_number: string
  capacity: number
  bus_type: string
  status: "active" | "maintenance" | "inactive"
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  origin: string
  destination: string
  distance_km: number | null
  duration_hours: number | null
  base_price: number
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  route_id: string
  bus_id: string
  departure_time: string
  arrival_time: string
  days_of_week: string[]
  status: "active" | "inactive"
  created_at: string
  updated_at: string
  route?: Route
  bus?: Bus
}

export interface Booking {
  id: string
  user_id: string
  schedule_id: string
  travel_date: string
  seat_numbers: number[]
  passenger_names: string[]
  passenger_phones: string[]
  total_amount: number
  booking_reference: string
  payment_status: "pending" | "paid" | "failed" | "refunded"
  booking_status: "confirmed" | "cancelled" | "completed"
  qr_code: string | null
  created_at: string
  updated_at: string
  schedule?: Schedule
}

export interface Payment {
  id: string
  booking_id: string
  amount: number
  payment_method: string
  transaction_id: string | null
  payment_status: "pending" | "completed" | "failed" | "refunded"
  created_at: string
  updated_at: string
}
