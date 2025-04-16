import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const body = await request.json()

    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id
    const { activity_type, description } = body

    if (!activity_type) {
      return NextResponse.json({ success: false, error: "Activity type is required" }, { status: 400 })
    }

    // Record the activity
    const { data: activity, error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        activity_type,
        description,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (activityError) {
      console.error("Error recording activity:", activityError)
      return NextResponse.json({ success: false, error: "Failed to record activity" }, { status: 500 })
    }

    // Update user stats to record activity
    const { data: currentStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching current stats:", statsError)
      return NextResponse.json({ success: false, error: "Failed to fetch user stats" }, { status: 500 })
    }

    if (currentStats) {
      // Calculate streak
      const lastActivityDate = new Date(currentStats.last_activity_date)
      const currentDate = new Date()
      const daysDiff = Math.floor((currentDate - lastActivityDate) / (1000 * 60 * 60 * 24))

      let updatedStreak = currentStats.current_streak
      let updatedLongestStreak = currentStats.longest_streak

      if (daysDiff === 1) {
        // If it's the next day, increment streak
        updatedStreak = currentStats.current_streak + 1
        if (updatedStreak > currentStats.longest_streak) {
          updatedLongestStreak = updatedStreak
        }
      } else if (daysDiff > 1) {
        // If more than one day has passed, reset streak to 1 (today)
        updatedStreak = 1
      }

      // Update stats
      const { data: updatedStats, error: updateError } = await supabase
        .from("user_stats")
        .update({
          current_streak: updatedStreak,
          longest_streak: updatedLongestStreak,
          last_activity_date: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating stats:", updateError)
        return NextResponse.json({ success: false, error: "Failed to update user stats" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: { activity, stats: updatedStats } })
    } else {
      // Initialize user stats if they don't exist
      const { data: newStats, error: insertError } = await supabase
        .from("user_stats")
        .insert({
          user_id: userId,
          course_count: 0,
          current_streak: 1, // Starting streak
          longest_streak: 1,
          hours_learned: 0,
          completed_this_month: 0,
          uiux_completed: false,
          uiux_progress: 0,
          web_development_completed: false,
          web_development_progress: 0,
          graphic_design_completed: false,
          graphic_design_progress: 0,
          last_activity_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error initializing user stats:", insertError)
        return NextResponse.json({ success: false, error: "Failed to initialize user stats" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: { activity, stats: newStats } })
    }
  } catch (error) {
    console.error("Error in user activity API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
