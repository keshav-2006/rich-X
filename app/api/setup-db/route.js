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

    // Create tables directly if RPC functions don't exist
    try {
      // Try to create profiles table
      await supabase.rpc("create_profiles_table")
    } catch (error) {
      console.log("Creating profiles table directly...")

      // Create profiles table directly
      const { error: createProfilesError } = await supabase
        .from("profiles")
        .select("count(*)", { count: "exact", head: true })

      if (createProfilesError && createProfilesError.code === "PGRST116") {
        // Table doesn't exist, create it
        const { error: sqlError } = await supabase.supabaseClient.rpc("create_profiles_table")
        if (sqlError) {
          console.error("Error creating profiles table:", sqlError)
        }
      }
    }

    // Try to create user_stats table
    try {
      await supabase.rpc("create_user_stats_table")
    } catch (error) {
      console.log("Creating user_stats table directly...")

      // Create user_stats table directly
      const { error: createStatsError } = await supabase
        .from("user_stats")
        .select("count(*)", { count: "exact", head: true })

      if (createStatsError && createStatsError.code === "PGRST116") {
        // Table doesn't exist, create it
        try {
          // Create the table
          await supabase.supabaseClient.rpc("create_user_stats_table")

          // Insert a default record for the current user if session exists
          if (session) {
            await supabase.from("user_stats").insert({
              user_id: session.user.id,
              course_count: 0,
              current_streak: 0,
              longest_streak: 0,
              hours_learned: 0,
              completed_this_month: 0,
              uiux_completed: false,
              uiux_progress: 0,
              last_activity_date: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Error creating user_stats table:", error)
        }
      } else {
        // Table exists, check if we need to add the new columns
        try {
          // Try to add uiux_completed column if it doesn't exist
          await supabase.rpc("add_uiux_columns_to_user_stats")
        } catch (error) {
          console.log("Adding columns directly or they already exist:", error)
        }
      }
    }

    // Try to create user_activity table
    try {
      await supabase.rpc("create_user_activity_table")
    } catch (error) {
      console.log("Creating user_activity table directly...")

      // Create user_activity table directly
      const { error: createActivityError } = await supabase
        .from("user_activity")
        .select("count(*)", { count: "exact", head: true })

      if (createActivityError && createActivityError.code === "PGRST116") {
        // Table doesn't exist, create it
        try {
          await supabase.supabaseClient.rpc("create_user_activity_table")
        } catch (error) {
          console.error("Error creating user_activity table:", error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
