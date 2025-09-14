import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  const authToken = cookieStore.get("sb-access-token")?.value

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        ...(authToken && {
          persistSession: false,
          autoRefreshToken: false,
        }),
      },
    },
  )

  if (authToken) {
    await supabase.auth.setSession({
      access_token: authToken,
      refresh_token: cookieStore.get("sb-refresh-token")?.value || "",
    })
  }

  return supabase
}
