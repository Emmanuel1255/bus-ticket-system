import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Update ticket status to completed
    const { data, error } = await supabase
      .from("bookings")
      .update({
        booking_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)
      .eq("payment_status", "paid")
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update ticket status",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Ticket marked as used successfully",
      ticket: {
        id: data.id,
        booking_reference: data.booking_reference,
        booking_status: data.booking_status,
      },
    })
  } catch (error) {
    console.error("Mark used API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
