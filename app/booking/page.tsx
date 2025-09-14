"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { dataService } from "@/lib/dataService"
import { DemoModeIndicator } from "@/components/demo-mode-indicator"
import type { Schedule, Route, Bus } from "@/lib/types"

interface ScheduleWithDetails extends Schedule {
  route: Route
  bus: Bus
}

interface PassengerInfo {
  name: string
  phone: string
}

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduleWithDetails | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  const scheduleId = searchParams.get("schedule")
  const travelDate = searchParams.get("date")
  const passengerCount = Number.parseInt(searchParams.get("passengers") || "1")

  useEffect(() => {
    if (scheduleId) {
      loadSchedule()
    }
  }, [scheduleId])

  useEffect(() => {
    // Initialize passenger info array
    setPassengerInfo(Array.from({ length: passengerCount }, () => ({ name: "", phone: "" })))
  }, [passengerCount])

  const loadSchedule = async () => {
    if (!scheduleId) return

    try {
      const { data, error } = await dataService.getScheduleById(scheduleId)

      if (data && !error) {
        setSchedule(data)
      }
    } catch (error) {
      console.error("Error loading schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeatSelection = (seatNumber: number) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber))
    } else if (selectedSeats.length < passengerCount) {
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  const updatePassengerInfo = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengerInfo]
    updated[index] = { ...updated[index], [field]: value }
    setPassengerInfo(updated)
  }

  const handleBooking = async () => {
    if (!schedule || selectedSeats.length !== passengerCount || !travelDate) return

    // Validate passenger info
    const isValid = passengerInfo.every((p) => p.name.trim() && p.phone.trim())
    if (!isValid) {
      alert("Please fill in all passenger information")
      return
    }

    setBooking(true)

    try {
      const {
        data: { user },
      } = await dataService.getCurrentUser()

      if (!user) {
        const returnUrl = `/booking?schedule=${scheduleId}&date=${travelDate}&passengers=${passengerCount}`
        router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
        return
      }

      const totalAmount = schedule.route.base_price * passengerCount

      const { data, error } = await dataService.createBooking({
        user_id: user.id,
        schedule_id: schedule.id,
        travel_date: travelDate,
        seat_numbers: selectedSeats,
        passenger_names: passengerInfo.map((p) => p.name),
        passenger_phones: passengerInfo.map((p) => p.phone),
        total_amount: totalAmount,
        payment_status: "pending",
        booking_status: "confirmed",
      })

      if (data && !error) {
        router.push(`/booking-confirmation/${data.id}`)
      } else {
        alert("Booking failed. Please try again.")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Booking failed. Please try again.")
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Schedule not found</p>
            <Button asChild>
              <Link href="/search">Back to Search</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalSeats = schedule.bus.capacity
  const seatsPerRow = 4
  const rows = Math.ceil(totalSeats / seatsPerRow)

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
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DemoModeIndicator />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seats</CardTitle>
                <CardDescription>
                  Choose {passengerCount} seat{passengerCount > 1 ? "s" : ""} for your journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Bus Layout */}
                <div className="bg-gray-100 p-6 rounded-lg mb-6">
                  <div className="text-center mb-4 text-sm font-medium text-gray-600">Driver</div>
                  <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                    {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seatNumber) => (
                      <button
                        key={seatNumber}
                        onClick={() => handleSeatSelection(seatNumber)}
                        className={`
                          w-12 h-12 rounded border-2 text-sm font-medium transition-colors
                          ${
                            selectedSeats.includes(seatNumber)
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-700 border-gray-300 hover:border-green-400"
                          }
                        `}
                        disabled={selectedSeats.length >= passengerCount && !selectedSeats.includes(seatNumber)}
                      >
                        {seatNumber}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </div>

                {/* Selected Seats */}
                {selectedSeats.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Selected Seats:</h3>
                    <div className="flex gap-2">
                      {selectedSeats.map((seat) => (
                        <Badge key={seat} variant="secondary">
                          Seat {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Passenger Information */}
            {selectedSeats.length === passengerCount && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Passenger Information</CardTitle>
                  <CardDescription>Please provide details for all passengers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {passengerInfo.map((passenger, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">
                          Passenger {index + 1} - Seat {selectedSeats[index]}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${index}`}>Full Name</Label>
                            <Input
                              id={`name-${index}`}
                              placeholder="Enter full name"
                              value={passenger.name}
                              onChange={(e) => updatePassengerInfo(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                            <Input
                              id={`phone-${index}`}
                              placeholder="Enter phone number"
                              value={passenger.phone}
                              onChange={(e) => updatePassengerInfo(index, "phone", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                      {schedule.route.origin} → {schedule.route.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {schedule.departure_time} - {schedule.arrival_time}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Travel Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Travel Date:</span>
                    <span className="font-medium">{travelDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bus:</span>
                    <span className="font-medium">
                      {schedule.bus.bus_number} ({schedule.bus.bus_type})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-medium">{passengerCount}</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per ticket:</span>
                    <span>Le {schedule.route.base_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of tickets:</span>
                    <span>{passengerCount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">
                      Le {(schedule.route.base_price * passengerCount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={
                    selectedSeats.length !== passengerCount ||
                    booking ||
                    !passengerInfo.every((p) => p.name.trim() && p.phone.trim())
                  }
                >
                  {booking ? "Processing..." : "Confirm Booking"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  You will be redirected to payment after confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}
