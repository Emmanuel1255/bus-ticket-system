"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { QrCode, Search, CheckCircle, XCircle, AlertTriangle, MapPin, Clock, Smartphone } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function MobileQRScannerPage() {
  const [manualCode, setManualCode] = useState("")
  const [scannedTicket, setScannedTicket] = useState<any>(null)
  const [validationResult, setValidationResult] = useState<"valid" | "invalid" | "used" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  const validateTicket = async (qrCode: string) => {
    setLoading(true)
    setError("")
    setScannedTicket(null)
    setValidationResult(null)

    try {
      // Search for ticket by QR code or booking reference
      const { data: ticket, error } = await supabase
        .from("bookings")
        .select(`
          *,
          schedule:schedules(
            *,
            route:routes(*),
            bus:buses(*)
          )
        `)
        .or(`qr_code.eq.${qrCode},booking_reference.eq.${qrCode}`)
        .eq("payment_status", "paid")
        .single()

      if (error || !ticket) {
        setValidationResult("invalid")
        setError("Ticket not found or invalid")
        return
      }

      setScannedTicket(ticket)

      // Check if ticket is valid for today
      const today = new Date().toISOString().split("T")[0]
      const travelDate = ticket.travel_date

      if (ticket.booking_status === "completed") {
        setValidationResult("used")
      } else if (travelDate === today) {
        setValidationResult("valid")
      } else if (travelDate < today) {
        setValidationResult("used")
      } else {
        setValidationResult("valid")
      }
    } catch (err) {
      setError("Error validating ticket")
      setValidationResult("invalid")
      console.error("Validation error:", err)
    } finally {
      setLoading(false)
    }
  }

  const markTicketAsUsed = async () => {
    if (!scannedTicket) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: "completed" })
        .eq("id", scannedTicket.id)

      if (!error) {
        setScannedTicket({ ...scannedTicket, booking_status: "completed" })
        setValidationResult("used")
      }
    } catch (err) {
      setError("Error updating ticket status")
      console.error("Update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const resetScanner = () => {
    setScannedTicket(null)
    setValidationResult(null)
    setError("")
    setManualCode("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">WF</span>
            </div>
            <div>
              <h1 className="font-bold">WAKA FINE BUSES</h1>
              <p className="text-xs text-green-100">Mobile Scanner</p>
            </div>
          </div>
          <Smartphone className="w-6 h-6" />
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Scanner Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <QrCode className="w-5 h-5 text-green-600" />
              Ticket Validator
            </CardTitle>
            <CardDescription className="text-sm">
              Enter booking reference or QR code to validate tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Enter booking reference (e.g., WFB-123456)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && manualCode && validateTicket(manualCode)}
                className="text-base"
              />
              <Button
                onClick={() => manualCode && validateTicket(manualCode)}
                disabled={!manualCode || loading}
                className="w-full bg-green-600 hover:bg-green-700 text-base py-3"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Validating..." : "Validate Ticket"}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {validationResult && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                {validationResult === "valid" && <CheckCircle className="w-5 h-5 text-green-600" />}
                {validationResult === "used" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                {validationResult === "invalid" && <XCircle className="w-5 h-5 text-red-600" />}
                {validationResult === "valid" && "Valid Ticket"}
                {validationResult === "used" && "Used Ticket"}
                {validationResult === "invalid" && "Invalid Ticket"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scannedTicket && (
                <>
                  {/* Status Badge */}
                  <div className="text-center">
                    <Badge
                      variant={
                        validationResult === "valid"
                          ? "default"
                          : validationResult === "used"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-base px-4 py-2"
                    >
                      {validationResult === "valid"
                        ? "✓ VALID FOR TRAVEL"
                        : validationResult === "used"
                          ? "⚠ ALREADY USED"
                          : "✗ INVALID"}
                    </Badge>
                  </div>

                  {/* Ticket Details */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Booking Reference</p>
                      <p className="font-bold text-lg">{scannedTicket.booking_reference}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <p className="font-medium">
                          {scannedTicket.schedule.route.origin} → {scannedTicket.schedule.route.destination}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {scannedTicket.schedule.departure_time} - {scannedTicket.schedule.arrival_time}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Travel Date</p>
                        <p className="font-medium">{scannedTicket.travel_date}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Bus</p>
                        <p className="font-medium">{scannedTicket.schedule.bus.bus_number}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Seats</p>
                        <p className="font-medium">{scannedTicket.seat_numbers.join(", ")}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Passengers</p>
                        <p className="font-medium">{scannedTicket.passenger_names.length}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Passengers</p>
                      <div className="space-y-1">
                        {scannedTicket.passenger_names.map((name: string, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{name}</span>
                            <span className="text-gray-600">Seat {scannedTicket.seat_numbers[index]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amount Paid:</span>
                        <span className="font-bold text-green-600">
                          Le {scannedTicket.total_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    {validationResult === "valid" && scannedTicket.booking_status === "confirmed" && (
                      <Button
                        onClick={markTicketAsUsed}
                        className="w-full bg-green-600 hover:bg-green-700 text-base py-3"
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {loading ? "Marking as Used..." : "Mark as Used"}
                      </Button>
                    )}

                    <Button onClick={resetScanner} variant="outline" className="w-full text-base py-3 bg-transparent">
                      Scan Another Ticket
                    </Button>
                  </div>
                </>
              )}

              {!scannedTicket && validationResult === "invalid" && (
                <div className="text-center py-6">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No valid ticket found</p>
                  <Button onClick={resetScanner} className="bg-green-600 hover:bg-green-700">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!validationResult && !loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">Ready to validate</p>
              <p className="text-sm text-gray-400">Enter a booking reference to check ticket validity</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/scanner">Desktop Scanner</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
