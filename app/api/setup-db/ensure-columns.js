import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json(
        {
          success: false,
          error: "Authentication error",
        },
        { status: 401 },
      )
    }

    // Ensure user_stats table has all required columns
    try {
      // Check if user_stats table exists
      const { error: checkError } = await supabase.from("user_stats").select("id").limit(1)

      if (checkError && checkError.code === "PGRST116") {
        // Table doesn't exist, create it
        await supabase.rpc("create_user_stats_table")
      }

      // Add required columns if they don't exist
      const { error: alterError } = await supabase.rpc("ensure_user_stats_columns")

      if (alterError) {
        console.error("Error ensuring user_stats columns:", alterError)

        // Try direct SQL approach
        // Note: This would require appropriate permissions
        const { error: sqlError } = await supabase.supabaseClient.rpc("ensure_user_stats_columns")

        if (sqlError) {
          console.error("Error with direct SQL approach:", sqlError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to ensure all required columns exist",
            },
            { status: 500 },
          )
        }
      }
    } catch (error) {
      console.error("Error ensuring columns:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database columns ensured successfully",
    })
  } catch (error) {
    console.error("Error ensuring database columns:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
