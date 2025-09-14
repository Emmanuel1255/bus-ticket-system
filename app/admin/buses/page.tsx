import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Bus } from "@/lib/types"

export default async function BusesPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?returnUrl=/admin/buses")
  }

  // Fetch all buses
  const { data: buses, error: busesError } = await supabase
    .from("buses")
    .select("*")
    .order("bus_number", { ascending: true })

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
            <h1 className="text-3xl font-bold text-gray-900">Bus Fleet Management</h1>
            <p className="text-gray-600">Manage your bus fleet and vehicle information</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/admin/buses/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Bus
            </Link>
          </Button>
        </div>

        {/* Buses Grid */}
        {buses && buses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus: Bus) => (
              <Card key={bus.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{bus.bus_number}</CardTitle>
                      <CardDescription>{bus.bus_type} Bus</CardDescription>
                    </div>
                    <Badge
                      variant={
                        bus.status === "active" ? "default" : bus.status === "maintenance" ? "secondary" : "destructive"
                      }
                    >
                      {bus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{bus.capacity} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{bus.bus_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Added:</span>
                      <span className="font-medium">{new Date(bus.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/buses/${bus.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Link href={`/admin/buses/${bus.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No buses found in your fleet</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/buses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Bus
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
