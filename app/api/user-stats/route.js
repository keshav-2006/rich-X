import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user_stats table exists
    const { data: tableExists, error: checkError } = await supabase
      .from("user_stats")
      .select("id")
      .limit(1)
      .maybeSingle()

    // If table doesn't exist, create it
    if (checkError && checkError.code === "PGRST116") {
      // Create user_stats table
      const { error: createError } = await supabase.rpc("create_user_stats_table")

      if (createError) {
        console.error("Error creating user_stats table:", createError)
        return NextResponse.json({ success: false, error: "Failed to create user_stats table" }, { status: 500 })
      }
    }

    // Get user stats
    const { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user stats:", statsError)
      return NextResponse.json({ success: false, error: "Failed to fetch user stats" }, { status: 500 })
    }

    // If user stats don't exist, create them with all necessary columns
    if (!userStats) {
      const { data: newStats, error: insertError } = await supabase
        .from("user_stats")
        .insert({
          user_id: userId,
          course_count: 0,
          current_streak: 0,
          longest_streak: 0,
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
        console.error("Error creating user stats:", insertError)
        return NextResponse.json({ success: false, error: "Failed to create user stats" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: newStats || {} })
    }

    // Check if we need to add missing columns
    let needsUpdate = false
    const updates = { ...userStats }

    // Check for missing columns and add default values if needed
    if (userStats.uiux_progress === undefined) {
      updates.uiux_progress = 0
      needsUpdate = true
    }

    if (userStats.uiux_completed === undefined) {
      updates.uiux_completed = false
      needsUpdate = true
    }

    if (userStats.web_development_progress === undefined) {
      updates.web_development_progress = 0
      needsUpdate = true
    }

    if (userStats.web_development_completed === undefined) {
      updates.web_development_completed = false
      needsUpdate = true
    }

    if (userStats.graphic_design_progress === undefined) {
      updates.graphic_design_progress = 0
      needsUpdate = true
    }

    if (userStats.graphic_design_completed === undefined) {
      updates.graphic_design_completed = false
      needsUpdate = true
    }

    // Update the record if needed
    if (needsUpdate) {
      const { data: updatedStats, error: updateError } = await supabase
        .from("user_stats")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating user stats with missing columns:", updateError)
        // Continue with existing data even if update fails
      } else {
        return NextResponse.json({ success: true, data: updatedStats })
      }
    }

    return NextResponse.json({ success: true, data: userStats })
  } catch (error) {
    console.error("Error in user stats API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Update user stats
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

    // If no stats exist, create them
    if (!currentStats) {
      const { data: newStats, error: insertError } = await supabase
        .from("user_stats")
        .insert({
          user_id: userId,
          ...body,
          uiux_completed: body.uiux_completed || false,
          uiux_progress: body.uiux_progress || 0,
          web_development_completed: body.web_development_completed || false,
          web_development_progress: body.web_development_progress || 0,
          graphic_design_completed: body.graphic_design_completed || false,
          graphic_design_progress: body.graphic_design_progress || 0,
          last_activity_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating user stats:", insertError)
        return NextResponse.json({ success: false, error: "Failed to create user stats" }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: newStats })
    }

    // Update streak logic
    let updatedStreak = currentStats.current_streak
    let updatedLongestStreak = currentStats.longest_streak
    const lastActivityDate = new Date(currentStats.last_activity_date)
    const currentDate = new Date()

    // Calculate days difference
    const daysDiff = Math.floor((currentDate - lastActivityDate) / (1000 * 60 * 60 * 24))

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
    // If same day (daysDiff === 0), keep current streak

    // Update user stats
    const { data: updatedStats, error: updateError } = await supabase
      .from("user_stats")
      .update({
        ...body,
        current_streak: updatedStreak,
        longest_streak: updatedLongestStreak,
        last_activity_date: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating user stats:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update user stats" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updatedStats })
  } catch (error) {
    console.error("Error in user stats API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
