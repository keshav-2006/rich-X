import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const type = requestUrl.searchParams.get("type")

    console.log("Auth callback received with code:", code ? "Code present" : "No code", "Type:", type)

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        // Redirect to home page with error
        return NextResponse.redirect(`${requestUrl.origin}?auth_error=${encodeURIComponent(error.message)}`)
      }

      // If this is a password reset, redirect to the reset password page
      if (type === "recovery") {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password#type=recovery&code=${code}`)
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${request.nextUrl.origin}?auth_error=An unexpected error occurred`)
  }
}
