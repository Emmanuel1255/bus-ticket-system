import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Clock, MapPin, Bus } from "lucide-react"
import Link from "next/link"

export default async function SchedulesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/admin/schedules")
  }

  // Fetch all schedules with related data
  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select(
      `
      *,
      route:routes(*),
      bus:buses(*)
    `,
    )
    .order("departure_time", { ascending: true })

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
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600">Manage bus schedules and timetables</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/admin/schedules/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Schedule
            </Link>
          </Button>
        </div>

        {/* Schedules Grid */}
        {schedules && schedules.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule: any) => (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        {schedule.route?.origin} → {schedule.route?.destination}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Bus className="w-3 h-3" />
                        {schedule.bus?.bus_number} ({schedule.bus?.bus_type})
                      </CardDescription>
                    </div>
                    <Badge variant={schedule.status === "active" ? "default" : "destructive"}>{schedule.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        {schedule.departure_time} - {schedule.arrival_time}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Operating Days:</p>
                      <div className="flex flex-wrap gap-1">
                        {schedule.days_of_week.map((day: string) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-bold text-green-600">
                        Le {schedule.route?.base_price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <span className="font-medium">{schedule.bus?.capacity} seats</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/schedules/${schedule.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/schedules/${schedule.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No schedules found in your system</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/schedules/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
