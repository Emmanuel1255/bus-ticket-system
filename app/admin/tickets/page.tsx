import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, QrCode, Eye } from "lucide-react"
import Link from "next/link"

export default async function AdminTicketsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/admin/tickets")
  }

  // Fetch all paid bookings (tickets)
  const { data: tickets, error: ticketsError } = await supabase
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
    .eq("payment_status", "paid")
    .order("travel_date", { ascending: true })
    .limit(100)

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
              <Link href="/admin/bookings" className="text-gray-700 hover:text-green-600 font-medium">
                Bookings
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
            <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
            <p className="text-gray-600">View and validate bus tickets</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by reference or QR..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Travel Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="all">All Dates</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="freetown-bo">Freetown → Bo</SelectItem>
                  <SelectItem value="freetown-kenema">Freetown → Kenema</SelectItem>
                  <SelectItem value="freetown-makeni">Freetown → Makeni</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        {tickets && tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid md:grid-cols-5 gap-4">
                      <div>
                        <p className="font-medium text-sm">{ticket.booking_reference}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {ticket.qr_code || "No QR"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {ticket.schedule?.route?.origin} → {ticket.schedule?.route?.destination}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ticket.schedule?.departure_time} - {ticket.schedule?.arrival_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Travel: {ticket.travel_date}</p>
                        <p className="text-xs text-gray-500">Bus: {ticket.schedule?.bus?.bus_number}</p>
                      </div>
                      <div>
                        <p className="text-sm">
                          {ticket.passenger_names.length} passenger{ticket.passenger_names.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500">Seats: {ticket.seat_numbers.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold">Le {ticket.total_amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          Booked: {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          ticket.booking_status === "confirmed"
                            ? "default"
                            : ticket.booking_status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {ticket.booking_status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tickets/${ticket.id}/validate`}>
                            <QrCode className="w-3 h-3 mr-1" />
                            Validate
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tickets/${ticket.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No tickets found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
