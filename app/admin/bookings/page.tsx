import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Eye } from "lucide-react"
import Link from "next/link"

export default async function BookingsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/admin/bookings")
  }

  // Fetch all bookings with related data
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
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WAKA FINE BUSES - Admin</span>
            </div>
            <nav className="flex space-x-8">
              <Link href="/admin" className="text-gray-700 hover:text-green-600 font-medium">
                Dashboard
              </Link>
              <Link href="/admin/buses" className="text-gray-700 hover:text-green-600 font-medium">
                Buses
              </Link>
              <Link href="/admin/routes" className="text-gray-700 hover:text-green-600 font-medium">
                Routes
              </Link>
              <Link href="/admin/schedules" className="text-gray-700 hover:text-green-600 font-medium">
                Schedules
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600">View and manage all ticket bookings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by reference..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        {bookings && bookings.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
              <CardDescription>Latest ticket bookings in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium text-sm">{booking.booking_reference}</p>
                          <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {booking.schedule?.route?.origin} → {booking.schedule?.route?.destination}
                          </p>
                          <p className="text-xs text-gray-500">Travel: {booking.travel_date}</p>
                        </div>
                        <div>
                          <p className="text-sm">
                            {booking.passenger_names.length} passenger{booking.passenger_names.length > 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-500">Seats: {booking.seat_numbers.join(", ")}</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">Le {booking.total_amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Bus: {booking.schedule?.bus?.bus_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              booking.payment_status === "paid"
                                ? "default"
                                : booking.payment_status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
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
                            className="text-xs"
                          >
                            {booking.booking_status}
                          </Badge>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/bookings/${booking.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No bookings found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
