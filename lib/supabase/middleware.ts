import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const authToken = request.cookies.get("sb-access-token")?.value
  const refreshToken = request.cookies.get("sb-refresh-token")?.value

  if (authToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: authToken,
      refresh_token: refreshToken,
    })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith("/my-bookings") && !user) {
    return NextResponse.redirect(new URL("/auth/login?returnUrl=/my-bookings", request.url))
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/auth/login?returnUrl=/admin", request.url))
  }

  return supabaseResponse
}
