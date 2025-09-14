"use client"

import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

export function DemoModeIndicator() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (!isDemoMode) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex items-center">
        <Info className="h-5 w-5 text-amber-400 mr-2" />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Demo Mode
          </Badge>
          <p className="text-sm text-amber-700">
            You are viewing demo data. No real bookings or payments will be processed.
          </p>
        </div>
      </div>
    </div>
  )
}
