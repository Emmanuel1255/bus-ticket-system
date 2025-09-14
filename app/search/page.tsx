"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Clock, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { dataService } from "@/lib/dataService"
import { DemoModeIndicator } from "@/components/demo-mode-indicator"
import type { Route, Schedule, Bus } from "@/lib/types"

interface ScheduleWithDetails extends Schedule {
  route: Route
  bus: Bus
}

export default function SearchPage() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [travelDate, setTravelDate] = useState<Date>()
  const [passengers, setPassengers] = useState("1")
  const [routes, setRoutes] = useState<Route[]>([])
  const [schedules, setSchedules] = useState<ScheduleWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  // Load available routes on component mount
  useEffect(() => {
    loadRoutes()
  }, [])

  const loadRoutes = async () => {
    const { data, error } = await dataService.getRoutes()

    if (data && !error) {
      setRoutes(data)
    }
  }

  const searchSchedules = async () => {
    if (!origin || !destination || !travelDate) return

    setLoading(true)
    setSearchPerformed(true)

    try {
      // Get the day of week for the travel date
      const dayOfWeek = format(travelDate, "EEEE").toLowerCase()

      const { data, error } = await dataService.getSchedulesByDay(dayOfWeek)

      if (data && !error) {
        // Filter schedules that match the origin and destination
        const filteredSchedules = data.filter(
          (schedule: any) =>
            schedule.route?.origin === origin &&
            schedule.route?.destination === destination &&
            schedule.route?.status === "active",
        )
        setSchedules(filteredSchedules)
      }
    } catch (error) {
      console.error("Error searching schedules:", error)
    } finally {
      setLoading(false)
    }
  }

  const uniqueOrigins = [...new Set(routes.map((route) => route.origin))].sort()
  const uniqueDestinations = [...new Set(routes.map((route) => route.destination))].sort()

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
            <nav className="hidden md:flex space-x-8">
              <Link href="/my-bookings" className="text-gray-700 hover:text-green-600 font-medium">
                My Bookings
              </Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-green-600 font-medium">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoModeIndicator />

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Search Bus Tickets</CardTitle>
            <CardDescription>Find and book your perfect journey across Sierra Leone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueOrigins.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDestinations.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Travel Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !travelDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {travelDate ? format(travelDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={travelDate}
                      onSelect={setTravelDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={searchSchedules}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !origin || !destination || !travelDate}
                >
                  {loading ? "Searching..." : "Search Buses"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchPerformed && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {schedules.length > 0 ? `Available Buses (${schedules.length} found)` : "No buses found for your search"}
            </h2>

            {schedules.length === 0 && !loading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">
                    No buses available for {origin} to {destination} on {travelDate && format(travelDate, "PPP")}
                  </p>
                  <p className="text-sm text-gray-400">Try selecting a different date or route.</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{schedule.route.origin}</span>
                          </div>
                          <div className="flex-1 border-t border-dashed border-gray-300"></div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="font-semibold">{schedule.route.destination}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Departure: {schedule.departure_time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Arrival: {schedule.arrival_time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              Bus: {schedule.bus.bus_number} ({schedule.bus.bus_type})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            Le {schedule.route.base_price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">per person</div>
                        </div>
                        <Button asChild className="bg-green-600 hover:bg-green-700">
                          <Link
                            href={`/booking?schedule=${schedule.id}&date=${travelDate?.toISOString().split("T")[0]}&passengers=${passengers}`}
                          >
                            Select Seats
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
