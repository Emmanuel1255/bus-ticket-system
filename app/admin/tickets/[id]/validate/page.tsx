"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, QrCode, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import QRCodeGenerator from "@/components/qr-code-generator"

export default function ValidateTicketPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<"valid" | "invalid" | "used" | null>(null)

  const supabase = createClient()
  const ticketId = params.id as string

  useEffect(() => {
    if (ticketId) {
      loadTicket()
    }
  }, [ticketId])

  const loadTicket = async () => {
    try {
      const { data, error } = await supabase
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
        .eq("id", ticketId)
        .eq("payment_status", "paid")
        .single()

      if (data && !error) {
        setTicket(data)
        // Auto-validate based on current date and travel date
        const today = new Date().toISOString().split("T")[0]
        const travelDate = data.travel_date

        if (travelDate === today) {
          setValidationResult("valid")
        } else if (travelDate < today) {
          setValidationResult("used")
        } else {
          setValidationResult("valid")
        }
      } else {
        setValidationResult("invalid")
      }
    } catch (error) {
      console.error("Error loading ticket:", error)
      setValidationResult("invalid")
    } finally {
      setLoading(false)
    }
  }

  const markAsUsed = async () => {
    if (!ticket) return

    setValidating(true)
    try {
      const { error } = await supabase.from("bookings").update({ booking_status: "completed" }).eq("id", ticket.id)

      if (!error) {
        setTicket({ ...ticket, booking_status: "completed" })
        setValidationResult("used")
      }
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Validating ticket...</p>
        </div>
      </div>
    )
  }

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
              <span className="text-xl font-bold text-gray-900">WAKA FINE BUSES - Ticket Validation</span>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/tickets">Back to Tickets</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Status */}
        <div className="text-center mb-8">
          {validationResult === "valid" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
              <h1 className="text-3xl font-bold text-green-600 mb-2">Valid Ticket</h1>
              <p className="text-gray-600">This ticket is valid for travel</p>
            </div>
          )}

          {validationResult === "used" && (
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-16 h-16 text-orange-500 mb-4" />
              <h1 className="text-3xl font-bold text-orange-500 mb-2">Ticket Used</h1>
              <p className="text-gray-600">This ticket has already been used or expired</p>
            </div>
          )}

          {validationResult === "invalid" && (
            <div className="flex flex-col items-center">
              <XCircle className="w-16 h-16 text-red-600 mb-4" />
              <h1 className="text-3xl font-bold text-red-600 mb-2">Invalid Ticket</h1>
              <p className="text-gray-600">This ticket is not valid or not found</p>
            </div>
          )}
        </div>

        {ticket && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ticket Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Ticket Details
                  </CardTitle>
                  <CardDescription>Booking Reference: {ticket.booking_reference}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Route Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Route Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{ticket.schedule.route.origin}</span>
                        <div className="flex-1 border-t border-dashed border-gray-300 mx-4"></div>
                        <span className="font-medium">{ticket.schedule.route.destination}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Departure: {ticket.schedule.departure_time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Arrival: {ticket.schedule.arrival_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Travel Details */}
                  <div>
                    <h3 className="font-semibold mb-3">Travel Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Travel Date</p>
                        <p className="font-medium">{ticket.travel_date}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Bus</p>
                        <p className="font-medium">
                          {ticket.schedule.bus.bus_number} ({ticket.schedule.bus.bus_type})
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Seats</p>
                        <p className="font-medium">{ticket.seat_numbers.join(", ")}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Passengers</p>
                        <p className="font-medium">{ticket.passenger_names.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Passenger Information</h3>
                    <div className="space-y-2">
                      {ticket.passenger_names.map((name: string, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-600">Seat {ticket.seat_numbers[index]}</p>
                          </div>
                          <p className="text-sm text-gray-600">{ticket.passenger_phones[index]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Validation Panel */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Ticket Validation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                      <QRCodeGenerator value={ticket.qr_code || ticket.booking_reference} size={150} />
                    </div>
                  </div>

                  <Separator />

                  {/* Status Information */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Payment Status:</span>
                      <Badge variant="default" className="bg-green-600">
                        Paid
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Booking Status:</span>
                      <Badge
                        variant={
                          ticket.booking_status === "confirmed"
                            ? "default"
                            : ticket.booking_status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {ticket.booking_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="font-bold text-green-600">Le {ticket.total_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Validation Actions */}
                  <div className="space-y-3">
                    {validationResult === "valid" && ticket.booking_status === "confirmed" && (
                      <Button
                        onClick={markAsUsed}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={validating}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {validating ? "Marking as Used..." : "Mark as Used"}
                      </Button>
                    )}

                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/admin/tickets/${ticket.id}`}>View Full Details</Link>
                    </Button>

                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/admin/tickets">Back to All Tickets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
