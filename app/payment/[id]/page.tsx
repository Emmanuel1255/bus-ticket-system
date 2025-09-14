"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone, Building, MapPin, Clock, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")

  const supabase = createClient()
  const bookingId = params.id as string

  useEffect(() => {
    if (bookingId) {
      loadBooking()
    }
  }, [bookingId])

  const loadBooking = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

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
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .single()

      if (data && !error) {
        setBooking(data)
        if (data.payment_status === "paid") {
          router.push(`/booking-confirmation/${bookingId}`)
        }
      } else {
        router.push("/my-bookings")
      }
    } catch (error) {
      console.error("Error loading booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async () => {
    if (!booking || !paymentMethod) return

    setProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        booking_id: booking.id,
        amount: booking.total_amount,
        payment_method: paymentMethod,
        transaction_id: `TXN${Date.now()}`,
        payment_status: "completed",
      })

      if (paymentError) throw paymentError

      // Update booking payment status
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          qr_code: `WFB-${booking.booking_reference}`,
        })
        .eq("id", booking.id)

      if (bookingError) throw bookingError

      // Redirect to confirmation
      router.push(`/booking-confirmation/${booking.id}`)
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Booking not found</p>
            <Button asChild>
              <Link href="/my-bookings">Back to Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Complete Your Payment
                </CardTitle>
                <CardDescription>Choose your preferred payment method to confirm your booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base font-medium">Payment Method</Label>
                  <div className="grid md:grid-cols-3 gap-4 mt-3">
                    <button
                      onClick={() => setPaymentMethod("mobile_money")}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        paymentMethod === "mobile_money"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Smartphone className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-sm text-gray-500">Orange Money, Africell Money</p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("bank_card")}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        paymentMethod === "bank_card"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-medium">Bank Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard</p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        paymentMethod === "bank_transfer"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Building className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-gray-500">Direct bank transfer</p>
                    </button>
                  </div>
                </div>

                {/* Payment Details Form */}
                {paymentMethod === "mobile_money" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Mobile Money Number</Label>
                      <Input
                        id="phone"
                        placeholder="+232 XX XXX XXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orange">Orange Money</SelectItem>
                          <SelectItem value="africell">Africell Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_card" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Bank Transfer Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Bank:</strong> Sierra Leone Commercial Bank
                      </p>
                      <p>
                        <strong>Account Name:</strong> WAKA FINE BUSES LTD
                      </p>
                      <p>
                        <strong>Account Number:</strong> 1234567890
                      </p>
                      <p>
                        <strong>Reference:</strong> {booking.booking_reference}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      Please use the booking reference as your transfer reference and contact us after making the
                      transfer.
                    </p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">
                      Your payment information is encrypted and secure. We do not store your payment details.
                    </p>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={processPayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!paymentMethod || processing}
                >
                  {processing ? "Processing Payment..." : `Pay Le ${booking.total_amount.toLocaleString()}`}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Reference: {booking.booking_reference}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                      {booking.schedule.route.origin} → {booking.schedule.route.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {booking.schedule.departure_time} - {booking.schedule.arrival_time}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Travel Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Travel Date:</span>
                    <span className="font-medium">{booking.travel_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-medium">{booking.passenger_names.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seats:</span>
                    <span className="font-medium">{booking.seat_numbers.join(", ")}</span>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price per ticket:</span>
                    <span>Le {booking.schedule.route.base_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Number of tickets:</span>
                    <span>{booking.passenger_names.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span className="text-green-600">Le {booking.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Status:</span>
                  <Badge variant="secondary">Payment Pending</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
