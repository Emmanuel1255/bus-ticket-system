import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Search for ticket by QR code or booking reference
    const { data: ticket, error } = await supabase
      .from("bookings")
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(*),
          bus:buses(*)
        )
      `)
      .or(`qr_code.eq.${qrCode},booking_reference.eq.${qrCode}`)
      .eq("payment_status", "paid")
      .single()

    if (error || !ticket) {
      return NextResponse.json({
        valid: false,
        status: "invalid",
        message: "Ticket not found or invalid",
      })
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

    return NextResponse.json({
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
          origin: ticket.schedule.route.origin,
          destination: ticket.schedule.route.destination,
        },
        schedule: {
          departure_time: ticket.schedule.departure_time,
          arrival_time: ticket.schedule.arrival_time,
        },
        bus: {
          bus_number: ticket.schedule.bus.bus_number,
          bus_type: ticket.schedule.bus.bus_type,
        },
      },
    })
  } catch (error) {
    console.error("Validation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
