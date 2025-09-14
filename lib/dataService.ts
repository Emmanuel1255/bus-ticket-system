import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"
import {
  demoBuses,
  demoRoutes,
  demoSchedules,
  demoBookings,
  getDemoBookingsByUser,
  getDemoBookingById,
  getDemoScheduleById,
  getDemoRoutesByOriginDestination,
  getDemoSchedulesByDay,
} from "./demoData"
import type { Bus, Route } from "./types"

// Check if demo mode is enabled
const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true"
}

// Client-side data service
export const dataService = {
  // Routes
  async getRoutes(): Promise<{ data: Route[] | null; error: any }> {
    if (isDemoMode()) {
      return { data: demoRoutes.filter((route) => route.status === "active"), error: null }
    }

    const supabase = createClient()
    return await supabase.from("routes").select("*").eq("status", "active").order("origin", { ascending: true })
  },

  async getRoutesByOriginDestination(
    origin?: string,
    destination?: string,
  ): Promise<{ data: Route[] | null; error: any }> {
    if (isDemoMode()) {
      const routes = getDemoRoutesByOriginDestination(origin, destination)
      return { data: routes.filter((route) => route.status === "active"), error: null }
    }

    const supabase = createClient()
    let query = supabase.from("routes").select("*").eq("status", "active")

    if (origin) query = query.eq("origin", origin)
    if (destination) query = query.eq("destination", destination)

    return await query
  },

  // Schedules
  async getSchedules(): Promise<{ data: any[] | null; error: any }> {
    if (isDemoMode()) {
      return { data: demoSchedules.filter((schedule) => schedule.status === "active"), error: null }
    }

    const supabase = createClient()
    return await supabase
      .from("schedules")
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq("status", "active")
  },

  async getSchedulesByDay(dayOfWeek: string): Promise<{ data: any[] | null; error: any }> {
    if (isDemoMode()) {
      const schedules = getDemoSchedulesByDay(dayOfWeek)
      return { data: schedules, error: null }
    }

    const supabase = createClient()
    return await supabase
      .from("schedules")
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq("status", "active")
      .contains("days_of_week", [dayOfWeek])
  },

  async getScheduleById(scheduleId: string): Promise<{ data: any | null; error: any }> {
    if (isDemoMode()) {
      const schedule = getDemoScheduleById(scheduleId)
      return { data: schedule || null, error: schedule ? null : { message: "Schedule not found" } }
    }

    const supabase = createClient()
    return await supabase
      .from("schedules")
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq("id", scheduleId)
      .single()
  },

  // Buses
  async getBuses(): Promise<{ data: Bus[] | null; error: any }> {
    if (isDemoMode()) {
      return { data: demoBuses, error: null }
    }

    const supabase = createClient()
    return await supabase.from("buses").select("*")
  },

  // Bookings
  async getBookingsByUser(userId: string): Promise<{ data: any[] | null; error: any }> {
    if (isDemoMode()) {
      const bookings = getDemoBookingsByUser(userId)
      return { data: bookings, error: null }
    }

    const supabase = createClient()
    return await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(*),
          bus:buses(*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
  },

  async getBookingById(bookingId: string): Promise<{ data: any | null; error: any }> {
    if (isDemoMode()) {
      const booking = getDemoBookingById(bookingId)
      return { data: booking || null, error: booking ? null : { message: "Booking not found" } }
    }

    const supabase = createClient()
    return await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(*),
          bus:buses(*)
        )
      `)
      .eq("id", bookingId)
      .single()
  },

  async getAllBookings(): Promise<{ data: any[] | null; error: any }> {
    if (isDemoMode()) {
      return { data: demoBookings, error: null }
    }

    const supabase = createClient()
    return await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(*),
          bus:buses(*)
        )
      `)
      .order("created_at", { ascending: false })
  },

  async createBooking(bookingData: any): Promise<{ data: any | null; error: any }> {
    if (isDemoMode()) {
      // In demo mode, simulate booking creation
      const newBooking = {
        ...bookingData,
        id: `demo-booking-${Date.now()}`,
        booking_reference: `WFB${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(
          Math.random() * 1000,
        )
          .toString()
          .padStart(3, "0")}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add to demo data (in memory only)
      demoBookings.push(newBooking)
      return { data: newBooking, error: null }
    }

    const supabase = createClient()
    return await supabase.from("bookings").insert(bookingData).select().single()
  },

  // Authentication
  async getCurrentUser(): Promise<{ data: { user: any } | null; error: any }> {
    if (isDemoMode()) {
      // Return a demo user for demo mode
      return {
        data: {
          user: {
            id: "demo-user-1",
            email: "demo@wakafinebuses.com",
            user_metadata: { full_name: "Demo User" },
          },
        },
        error: null,
      }
    }

    const supabase = createClient()
    return await supabase.auth.getUser()
  },

  // Statistics (for admin dashboard)
  async getDashboardStats(): Promise<{
    totalBuses: number
    totalRoutes: number
    totalBookings: number
    totalRevenue: number
  }> {
    if (isDemoMode()) {
      return {
        totalBuses: demoBuses.length,
        totalRoutes: demoRoutes.length,
        totalBookings: demoBookings.length,
        totalRevenue: demoBookings
          .filter((booking) => booking.payment_status === "paid")
          .reduce((sum, booking) => sum + booking.total_amount, 0),
      }
    }

    const supabase = createClient()

    const [busesResult, routesResult, bookingsResult, revenueResult] = await Promise.all([
      supabase.from("buses").select("*", { count: "exact" }),
      supabase.from("routes").select("*", { count: "exact" }),
      supabase.from("bookings").select("*", { count: "exact" }),
      supabase.from("bookings").select("total_amount").eq("payment_status", "paid"),
    ])

    return {
      totalBuses: busesResult.count || 0,
      totalRoutes: routesResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalRevenue: revenueResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0,
    }
  },

  // Ticket validation
  async validateTicket(qrCode: string): Promise<{ valid: boolean; status: string; message: string; ticket?: any }> {
    if (isDemoMode()) {
      // Find ticket by QR code or booking reference in demo data
      const ticket = demoBookings.find((booking) => booking.qr_code === qrCode || booking.booking_reference === qrCode)

      if (!ticket || ticket.payment_status !== "paid") {
        return {
          valid: false,
          status: "invalid",
          message: "Ticket not found or invalid",
        }
      }

      // Check if ticket is valid for today
      const today = new Date().toISOString().split("T")[0]
      const travelDate = ticket.travel_date

      let status = "valid"
      let message = "Ticket is valid for travel"

      if (ticket.booking_status === "completed") {
        status = "used"
        message = "Ticket has already been used"
      } else if (travelDate < today) {
        status = "expired"
        message = "Ticket has expired"
      } else if (travelDate > today) {
        status = "future"
        message = "Ticket is valid for future travel"
      }

      return {
        valid: status === "valid" || status === "future",
        status,
        message,
        ticket: {
          id: ticket.id,
          booking_reference: ticket.booking_reference,
          travel_date: ticket.travel_date,
          passenger_names: ticket.passenger_names,
          seat_numbers: ticket.seat_numbers,
          total_amount: ticket.total_amount,
          booking_status: ticket.booking_status,
          route: {
            origin: ticket.schedule?.route?.origin,
            destination: ticket.schedule?.route?.destination,
          },
          schedule: {
            departure_time: ticket.schedule?.departure_time,
            arrival_time: ticket.schedule?.arrival_time,
          },
          bus: {
            bus_number: ticket.schedule?.bus?.bus_number,
            bus_type: ticket.schedule?.bus?.bus_type,
          },
        },
      }
    }

    // In real mode, make API call to validation endpoint
    const response = await fetch("/api/scanner/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode }),
    })

    return await response.json()
  },
}

// Server-side data service (for server components)
export const serverDataService = {
  async getCurrentUser() {
    if (isDemoMode()) {
      return {
        data: {
          user: {
            id: "demo-user-1",
            email: "demo@wakafinebuses.com",
            user_metadata: { full_name: "Demo User" },
          },
        },
        error: null,
      }
    }

    const supabase = await createServerClient()
    return await supabase.auth.getUser()
  },

  async getDashboardStats() {
    if (isDemoMode()) {
      return {
        totalBuses: demoBuses.length,
        totalRoutes: demoRoutes.length,
        totalBookings: demoBookings.length,
        totalRevenue: demoBookings
          .filter((booking) => booking.payment_status === "paid")
          .reduce((sum, booking) => sum + booking.total_amount, 0),
      }
    }

    const supabase = await createServerClient()

    const [busesResult, routesResult, bookingsResult, revenueResult] = await Promise.all([
      supabase.from("buses").select("*", { count: "exact" }),
      supabase.from("routes").select("*", { count: "exact" }),
      supabase.from("bookings").select("*", { count: "exact" }),
      supabase.from("bookings").select("total_amount").eq("payment_status", "paid"),
    ])

    return {
      totalBuses: busesResult.count || 0,
      totalRoutes: routesResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalRevenue: revenueResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0,
    }
  },

  async getRecentBookings(limit = 5) {
    if (isDemoMode()) {
      return {
        data: demoBookings
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit),
        error: null,
      }
    }

    const supabase = await createServerClient()
    return await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(*),
          bus:buses(*)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)
  },
}
