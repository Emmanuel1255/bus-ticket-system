"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Camera,
  CameraOff,
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [scannedTicket, setScannedTicket] = useState<any>(null)
  const [validationResult, setValidationResult] = useState<"valid" | "invalid" | "used" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const supabase = createClient()

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)

        // Start scanning for QR codes
        scanForQRCode()
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const scanForQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0) {
      // Video not ready, try again
      setTimeout(scanForQRCode, 100)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // In a real implementation, you would use a QR code detection library here
    // For demo purposes, we'll simulate QR code detection
    setTimeout(() => {
      if (isScanning) {
        // Simulate finding a QR code occasionally
        if (Math.random() > 0.95) {
          const mockQRCode = `WFB-${Date.now()}`
          handleQRCodeDetected(mockQRCode)
        } else {
          scanForQRCode()
        }
      }
    }, 100)
  }

  const handleQRCodeDetected = (qrCode: string) => {
    stopCamera()
    validateTicket(qrCode)
  }

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WAKA FINE BUSES - QR Scanner</span>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/tickets">All Tickets</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Scanner</h1>
          <p className="text-gray-600">Scan QR codes to validate bus tickets</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>Use your camera to scan ticket QR codes or enter manually</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Camera Section */}
                <div className="text-center">
                  {!isScanning ? (
                    <div className="space-y-4">
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">Camera not active</p>
                        </div>
                      </div>
                      <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-64 bg-black rounded-lg object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-0 border-2 border-green-600 rounded-lg pointer-events-none">
                          <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-600"></div>
                          <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-600"></div>
                          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-600"></div>
                          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-600"></div>
                        </div>
                      </div>
                      <Button onClick={stopCamera} variant="outline">
                        <CameraOff className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Manual Entry */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Manual Entry</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter QR code or booking reference"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && manualCode && validateTicket(manualCode)}
                    />
                    <Button
                      onClick={() => manualCode && validateTicket(manualCode)}
                      disabled={!manualCode || loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Validate
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Validating ticket...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {validationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validationResult === "valid" && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {validationResult === "used" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                    {validationResult === "invalid" && <XCircle className="w-5 h-5 text-red-600" />}
                    Validation Result
                  </CardTitle>
                  <CardDescription>
                    {validationResult === "valid" && "Ticket is valid for travel"}
                    {validationResult === "used" && "Ticket has been used or expired"}
                    {validationResult === "invalid" && "Ticket is invalid or not found"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {scannedTicket && (
                    <>
                      {/* Ticket Information */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Booking Reference:</span>
                          <span className="text-lg font-bold">{scannedTicket.booking_reference}</span>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="font-medium">
                              {scannedTicket.schedule.route.origin} → {scannedTicket.schedule.route.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {scannedTicket.schedule.departure_time} - {scannedTicket.schedule.arrival_time}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Travel Date</p>
                            <p className="font-medium">{scannedTicket.travel_date}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Bus</p>
                            <p className="font-medium">{scannedTicket.schedule.bus.bus_number}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Seats</p>
                            <p className="font-medium">{scannedTicket.seat_numbers.join(", ")}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Passengers</p>
                            <p className="font-medium">{scannedTicket.passenger_names.length}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Passengers
                          </h4>
                          {scannedTicket.passenger_names.map((name: string, index: number) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{name}</span>
                              <span className="text-sm text-gray-600">Seat {scannedTicket.seat_numbers[index]}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-medium">Status:</span>
                          <Badge
                            variant={
                              validationResult === "valid"
                                ? "default"
                                : validationResult === "used"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {validationResult === "valid"
                              ? "Valid"
                              : validationResult === "used"
                                ? "Used/Expired"
                                : "Invalid"}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-medium">Amount:</span>
                          <span className="font-bold text-green-600">
                            Le {scannedTicket.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      {/* Actions */}
                      <div className="space-y-3">
                        {validationResult === "valid" && scannedTicket.booking_status === "confirmed" && (
                          <Button
                            onClick={markTicketAsUsed}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {loading ? "Marking as Used..." : "Mark as Used"}
                          </Button>
                        )}

                        <Button onClick={resetScanner} variant="outline" className="w-full bg-transparent">
                          Scan Another Ticket
                        </Button>

                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/admin/tickets/${scannedTicket.id}`}>View Full Details</Link>
                        </Button>
                      </div>
                    </>
                  )}

                  {!scannedTicket && validationResult === "invalid" && (
                    <div className="text-center py-8">
                      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
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
                <CardContent className="py-12 text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Ready to scan</p>
                  <p className="text-sm text-gray-400">Point your camera at a QR code or enter the code manually</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/tickets">View All Tickets</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
