import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, CreditCard, Eye, Download } from "lucide-react"
import Link from "next/link"

export default async function MyBookingsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/my-bookings")
  }

  // Fetch user's bookings
  const { data: bookings, error: bookingsError } = await supabase
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

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
              <Link href="/search" className="text-gray-700 hover:text-green-600 font-medium">
                Book Ticket
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-green-600 font-medium">
                Logout
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">View and manage your bus ticket bookings</p>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{booking.booking_reference}</h3>
                          <p className="text-sm text-gray-500">
                            Booked on {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
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

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Route</p>
                            <p className="font-medium text-sm">
                              {booking.schedule.route.origin} → {booking.schedule.route.destination}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-600">Travel Date</p>
                            <p className="font-medium text-sm">{booking.travel_date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Passengers</p>
                            <p className="font-medium text-sm">
                              {booking.passenger_names.length} • Seats {booking.seat_numbers.join(", ")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="font-bold text-sm text-green-600">
                              Le {booking.total_amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {booking.payment_status === "pending" && (
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                          <Link href={`/payment/${booking.id}`}>Complete Payment</Link>
                        </Button>
                      )}

                      {booking.payment_status === "paid" && (
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                          <Link href={`/ticket/${booking.id}`}>
                            <Download className="w-4 h-4 mr-2" />
                            View Ticket
                          </Link>
                        </Button>
                      )}

                      <Button asChild variant="outline">
                        <Link href={`/booking-confirmation/${booking.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven't made any bookings yet</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/search">Book Your First Ticket</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
