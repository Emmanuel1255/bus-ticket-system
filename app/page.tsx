import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Shield, Smartphone } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WF</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WAKA FINE BUSES</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/search" className="text-gray-700 hover:text-green-600 font-medium">
                Book Ticket
              </Link>
              <Link href="/my-bookings" className="text-gray-700 hover:text-green-600 font-medium">
                My Bookings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Travel Across Sierra Leone with <span className="text-green-600">Comfort & Safety</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-2xl mx-auto">
            Book your bus tickets online for routes across Sierra Leone. Safe, reliable, and affordable transportation
            from Freetown to Bo, Kenema, Makeni, and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
              <Link href="/search">Book Your Ticket Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-3 bg-transparent">
              <Link href="/routes">View All Routes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose WAKA FINE BUSES?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Wide Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Routes connecting all major cities across Sierra Leone including Freetown, Bo, Kenema, and Makeni.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">On-Time Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reliable departure and arrival times with real-time updates for your peace of mind.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Safe & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Well-maintained buses with experienced drivers and comprehensive insurance coverage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Smartphone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book tickets online with mobile-friendly interface and instant confirmation via SMS.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Popular Routes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Freetown → Bo</span>
                  <span className="text-green-600 font-bold">Le 50,000</span>
                </CardTitle>
                <CardDescription>4.5 hours • 250 km</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Daily departures at 6:00 AM and 2:00 PM</p>
                <Button asChild className="w-full">
                  <Link href="/search?origin=Freetown&destination=Bo">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Freetown → Kenema</span>
                  <span className="text-green-600 font-bold">Le 60,000</span>
                </CardTitle>
                <CardDescription>5.0 hours • 300 km</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Daily departures at 2:00 PM</p>
                <Button asChild className="w-full">
                  <Link href="/search?origin=Freetown&destination=Kenema">Book Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Freetown → Makeni</span>
                  <span className="text-green-600 font-bold">Le 40,000</span>
                </CardTitle>
                <CardDescription>3.5 hours • 180 km</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Departures Mon, Wed, Fri, Sun at 8:00 AM</p>
                <Button asChild className="w-full">
                  <Link href="/search?origin=Freetown&destination=Makeni">Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WF</span>
                </div>
                <span className="text-xl font-bold">WAKA FINE BUSES</span>
              </div>
              <p className="text-gray-400">
                Sierra Leone's trusted bus transportation service connecting communities across the country.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/search" className="hover:text-white">
                    Book Ticket
                  </Link>
                </li>
                <li>
                  <Link href="/routes" className="hover:text-white">
                    Routes
                  </Link>
                </li>
                <li>
                  <Link href="/my-bookings" className="hover:text-white">
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p>Phone: +232 XX XXX XXXX</p>
                <p>Email: info@wakafine.sl</p>
                <p>Address: Freetown, Sierra Leone</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 WAKA FINE BUSES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
