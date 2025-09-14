import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface BookingConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch booking details
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      schedule:schedules(
        *,
        route:routes(*),
        bus:buses(*)
      )
    `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !booking) {
    redirect("/my-bookings")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WAKA FINE BUSES</span>
            </Link>
            <nav className="flex space-x-8">
              <Link href="/my-bookings" className="text-gray-700 hover:text-green-600 font-medium">
                My Bookings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          {booking.payment_status === "paid" ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Your ticket has been booked and payment is complete</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Created</h1>
              <p className="text-gray-600">Complete your payment to confirm your ticket</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Trip Details
                </CardTitle>
                <CardDescription>Booking Reference: {booking.booking_reference}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Route Information */}
                <div>
                  <h3 className="font-semibold mb-3">Route Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{booking.schedule.route.origin}</span>
                      <div className="flex-1 border-t border-dashed border-gray-300 mx-4"></div>
                      <span className="font-medium">{booking.schedule.route.destination}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Departure: {booking.schedule.departure_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Arrival: {booking.schedule.arrival_time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Details */}
                <div>
                  <h3 className="font-semibold mb-3">Travel Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Travel Date</p>
                      <p className="font-medium">{booking.travel_date}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Bus</p>
                      <p className="font-medium">
                        {booking.schedule.bus.bus_number} ({booking.schedule.bus.bus_type})
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Seats</p>
                      <p className="font-medium">{booking.seat_numbers.join(", ")}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Passengers</p>
                      <p className="font-medium">{booking.passenger_names.length}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                <div>
                  <h3 className="font-semibold mb-3">Passenger Information</h3>
                  <div className="space-y-2">
                    {booking.passenger_names.map((name: string, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-sm text-gray-600">Seat {booking.seat_numbers[index]}</p>
                        </div>
                        <p className="text-sm text-gray-600">{booking.passenger_phones[index]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per ticket:</span>
                    <span>Le {booking.schedule.route.base_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of tickets:</span>
                    <span>{booking.passenger_names.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">Le {booking.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment Status:</span>
                    <Badge
                      variant={
                        booking.payment_status === "paid"
                          ? "default"
                          : booking.payment_status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {booking.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Booking Status:</span>
                    <Badge
                      variant={
                        booking.booking_status === "confirmed"
                          ? "default"
                          : booking.booking_status === "completed"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {booking.booking_status}
                    </Badge>
                  </div>
                </div>

                {booking.payment_status === "pending" && (
                  <div className="space-y-3">
                    <Separator />
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href={`/payment/${booking.id}`}>Complete Payment</Link>
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Your seats are reserved for 30 minutes. Complete payment to confirm your booking.
                    </p>
                  </div>
                )}

                {booking.payment_status === "paid" && (
                  <div className="space-y-3">
                    <Separator />
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href={`/ticket/${booking.id}`}>View Ticket</Link>
                    </Button>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href="/my-bookings">View All Bookings</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
