import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import type { Route } from "@/lib/types"

export default async function RoutesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/admin/routes")
  }

  // Fetch all routes
  const { data: routes, error: routesError } = await supabase
    .from("routes")
    .select("*")
    .order("origin", { ascending: true })

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
            <h1 className="text-3xl font-bold text-gray-900">Route Management</h1>
            <p className="text-gray-600">Manage your bus routes and destinations</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/admin/routes/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Route
            </Link>
          </Button>
        </div>

        {/* Routes Grid */}
        {routes && routes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route: Route) => (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        {route.origin} → {route.destination}
                      </CardTitle>
                      <CardDescription>
                        {route.distance_km ? `${route.distance_km} km` : "Distance not set"}
                      </CardDescription>
                    </div>
                    <Badge variant={route.status === "active" ? "default" : "destructive"}>{route.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Price:</span>
                      <span className="font-bold text-green-600">Le {route.base_price.toLocaleString()}</span>
                    </div>
                    {route.duration_hours && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration:
                        </span>
                        <span className="font-medium">{route.duration_hours} hours</span>
                      </div>
                    )}
                    {route.distance_km && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Distance:</span>
                        <span className="font-medium">{route.distance_km} km</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{new Date(route.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/routes/${route.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/routes/${route.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No routes found in your system</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/routes/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Route
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
