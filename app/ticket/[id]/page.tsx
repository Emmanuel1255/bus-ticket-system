import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, Users, Bus, QrCode, Download, Share, CheckCircle } from "lucide-react"
import Link from "next/link"
import QRCodeGenerator from "@/components/qr-code-generator"

interface TicketPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
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

  if (error || !booking || booking.payment_status !== "paid") {
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
        {/* Ticket Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bus Ticket</h1>
            <p className="text-gray-600">Present this ticket at the bus station</p>
          </div>
        </div>

        {/* Main Ticket */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">WAKA FINE BUSES</h2>
                <p className="text-green-100">Bus Ticket</p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-sm">Booking Reference</p>
                <p className="text-xl font-bold">{booking.booking_reference}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Route & Schedule Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Route */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Route Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{booking.schedule.route.origin}</p>
                        <p className="text-sm text-gray-600">Departure</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                          <Bus className="w-6 h-6 text-green-600 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{booking.schedule.route.destination}</p>
                        <p className="text-sm text-gray-600">Arrival</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{booking.schedule.departure_time}</span>
                      <span>{booking.schedule.arrival_time}</span>
                    </div>
                  </div>
                </div>

                {/* Travel Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Travel Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Travel Date</p>
                      <p className="text-lg font-bold">{new Date(booking.travel_date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Bus Details</p>
                      <p className="text-lg font-bold">
                        {booking.schedule.bus.bus_number} ({booking.schedule.bus.bus_type})
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Seat Numbers</p>
                      <p className="text-lg font-bold">{booking.seat_numbers.join(", ")}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Passengers</p>
                      <p className="text-lg font-bold">{booking.passenger_names.length}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Passenger Information
                  </h3>
                  <div className="space-y-3">
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
              </div>

              {/* QR Code & Actions */}
              <div className="space-y-6">
                {/* QR Code */}
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-3 flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5 text-gray-700" />
                    Ticket QR Code
                  </h3>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <QRCodeGenerator value={booking.qr_code || booking.booking_reference} size={200} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Show this QR code to the bus conductor</p>
                </div>

                {/* Ticket Status */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payment Status:</span>
                    <Badge variant="default" className="bg-green-600">
                      Paid
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ticket Status:</span>
                    <Badge variant="default">{booking.booking_status}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount Paid:</span>
                    <span className="font-bold text-green-600">Le {booking.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Share className="w-4 h-4 mr-2" />
                    Share Ticket
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/my-bookings">View All Bookings</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Before You Travel</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Arrive at the station 30 minutes before departure</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• Keep your ticket and QR code ready</li>
                  <li>• Check for any schedule changes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tickets are non-transferable</li>
                  <li>• Refunds available up to 24 hours before travel</li>
                  <li>• Luggage restrictions apply</li>
                  <li>• Children under 5 travel free</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Contact us at +232 XX XXX XXXX or info@wakafine.sl</p>
          <p className="mt-1">WAKA FINE BUSES - Your trusted travel partner in Sierra Leone</p>
        </div>
      </div>
    </div>
  )
}
