import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // This would be a webhook from your payment provider
    // For demo purposes, we'll simulate payment confirmation
    const { booking_id, transaction_id, status, amount } = body

    if (status === "success") {
      // Update booking payment status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          qr_code: `WFB-${Date.now()}`,
        })
        .eq("id", booking_id)

      if (bookingError) {
        throw bookingError
      }

      // Update payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          payment_status: "completed",
          transaction_id: transaction_id,
        })
        .eq("booking_id", booking_id)

      if (paymentError) {
        throw paymentError
      }

      return NextResponse.json({ success: true })
    } else {
      // Handle failed payment
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          payment_status: "failed",
        })
        .eq("booking_id", booking_id)

      if (paymentError) {
        throw paymentError
      }

      return NextResponse.json({ success: false, error: "Payment failed" })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
