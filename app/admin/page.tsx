import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bus, Route, Users, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/admin")
  }

  // For demo purposes, we'll assume any logged-in user can access admin
  // In production, you'd check for admin role/permissions

  // Fetch dashboard statistics
  const [busesResult, routesResult, bookingsResult, revenueResult] = await Promise.all([
    supabase.from("buses").select("*", { count: "exact" }),
    supabase.from("routes").select("*", { count: "exact" }),
    supabase.from("bookings").select("*", { count: "exact" }),
    supabase.from("bookings").select("total_amount").eq("payment_status", "paid"),
  ])

  const totalBuses = busesResult.count || 0
  const totalRoutes = routesResult.count || 0
  const totalBookings = bookingsResult.count || 0
  const totalRevenue = revenueResult.data?.reduce((sum, booking) => sum + booking.total_amount, 0) || 0

  // Get recent bookings
  const { data: recentBookings } = await supabase
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
    .limit(5)

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
              <Link href="/admin/buses" className="text-gray-700 hover:text-green-600 font-medium">
                Buses
              </Link>
              <Link href="/admin/routes" className="text-gray-700 hover:text-green-600 font-medium">
                Routes
              </Link>
              <Link href="/admin/bookings" className="text-gray-700 hover:text-green-600 font-medium">
                Bookings
              </Link>
              <Link href="/admin/schedules" className="text-gray-700 hover:text-green-600 font-medium">
                Schedules
              </Link>
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
                Public Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your bus transportation system</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBuses}</div>
              <p className="text-xs text-muted-foreground">Active fleet vehicles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRoutes}</div>
              <p className="text-xs text-muted-foreground">Available destinations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Le {totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Paid bookings only</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest ticket bookings in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings && recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{booking.booking_reference}</p>
                          <p className="text-sm text-gray-600">
                            {booking.schedule?.route?.origin} → {booking.schedule?.route?.destination}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Travel: {booking.travel_date}</p>
                          <p>Seats: {booking.seat_numbers.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">Le {booking.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{booking.passenger_names.length} passengers</p>
                      </div>
                      <div className="flex flex-col gap-1">
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
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No bookings found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
