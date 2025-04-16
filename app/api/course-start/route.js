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
    const { course } = body

    if (!course) {
      return NextResponse.json({ success: false, error: "Course is required" }, { status: 400 })
    }

    // Get current user stats
    const { data: currentStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user stats:", statsError)
      return NextResponse.json({ success: false, error: "Failed to fetch user stats" }, { status: 500 })
    }

    // Initialize stats if they don't exist
    if (!currentStats) {
      const initialStats = {
        user_id: userId,
        course_count: 1,
        current_streak: 1,
        longest_streak: 1,
        hours_learned: 0.5, // Add some hours for starting
        completed_this_month: 0,
        last_activity_date: new Date().toISOString(),
      }

      // Add course-specific fields
      initialStats[`${course}_progress`] = 0 // Start with 10% progress
      initialStats[`${course}_completed`] = false

      const { data: newStats, error: insertError } = await supabase
        .from("user_stats")
        .insert(initialStats)
        .select()
        .single()

      if (insertError) {
        console.error("Error initializing user stats:", insertError)
        return NextResponse.json({ success: false, error: "Failed to initialize user stats" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: newStats })
    }

    // Update stats
    const updates = {
      course_count: currentStats.course_count + 1,
      hours_learned: currentStats.hours_learned + 0.5, // Add some hours for starting
      last_activity_date: new Date().toISOString(),
    }

    // Add course-specific updates
    updates[`${course}_progress`] = Math.max(currentStats[`${course}_progress`] || 0, 10) // Ensure at least 10% progress

    const { data: updatedStats, error: updateError } = await supabase
      .from("user_stats")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating course stats:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update course stats" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updatedStats })
  } catch (error) {
    console.error("Error in course start API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
