"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AnimatedBackground from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  User,
  BarChart3,
  BookOpen,
  Loader2,
  LogOut,
  GraduationCap,
  Code,
  Palette,
  FileText,
  ExternalLink,
  Settings,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ProgressChart from "@/components/progress-chart"
import LogoMarquee from "@/components/logo-marquee"
import ContactMentorModal from "@/components/contact-mentor-modal"
import CurriculumModal from "@/components/curriculum-modal"

// Add mentor data
const mentors = {
  sarthak: {
    name: "Sarthak Bhudija",
    email: "sarthakz.ux@gmail.com",
    phone: "+91 98175 61087",
  },
  keshav: {
    name: "Keshav Mishra",
    email: "keshav.mjdm@gmail.com",
    phone: "+91 8159873077",
  },
  bhavesh: {
    name: "Bhavesh Sharma",
    email: "bhavesh001alpha@gmail.com",
    phone: "+91 90242 95647",
    isFounder: true,
  },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProgressChart, setShowProgressChart] = useState(false)
  const [activeMentor, setActiveMentor] = useState(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const [courseCount, setCourseCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [hoursLearned, setHoursLearned] = useState(0)
  const [completedThisMonth, setCompletedThisMonth] = useState(0)
  const [uiuxCompleted, setUiuxCompleted] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [dbInitialized, setDbInitialized] = useState(false)
  const [courseProgress, setCourseProgress] = useState({
    uiux: 0, // 0-100 percentage
  })
  const [contactMentorModalOpen, setContactMentorModalOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [curriculumModal, setCurriculumModal] = useState({ open: false, course: null })

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        setUser(session.user)

        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError)
        }

        setProfile(profileData || { id: session.user.id })

        // Initialize database tables if needed
        await initializeDatabase()

        // Fetch user stats
        await fetchUserStats()

        // Record user activity (login)
        await recordUserActivity("Login", "Logged into the platform")
      } catch (error) {
        console.error("Error getting session:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/")
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    // Load Copperplate Gothic font
    const style = document.createElement("style")
    style.textContent = `
      @font-face {
        font-family: 'Copperplate Gothic';
        src: url('https://fonts.cdnfonts.com/css/copperplate-gothic') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `
    document.head.appendChild(style)

    return () => {
      subscription.unsubscribe()
      document.head.removeChild(style)
    }
  }, [supabase, router])

  const initializeDatabase = async () => {
    try {
      // Create user_stats table if it doesn't exist
      try {
        const { error: statsError } = await supabase.rpc("create_user_stats_table")

        if (statsError) {
          console.error("Error creating user_stats table:", statsError)

          // Try direct SQL approach if RPC fails
          const { error: sqlError } = await supabase
            .from("user_stats")
            .select("count(*)", { count: "exact", head: true })

          if (sqlError && sqlError.code === "PGRST116") {
            // Table doesn't exist, create it
            await supabase.auth.getSession().then(async ({ data: { session } }) => {
              if (session) {
                // Insert a default record for the current user
                const { error: insertError } = await supabase.from("user_stats").insert({
                  user_id: session.user.id,
                  course_count: 0,
                  current_streak: 0,
                  longest_streak: 0,
                  hours_learned: 0,
                  completed_this_month: 0,
                  uiux_completed: false,
                  last_activity_date: new Date().toISOString(),
                })

                if (!insertError) {
                  setDbInitialized(true)
                }
              }
            })
          } else {
            setDbInitialized(true)
          }
        } else {
          setDbInitialized(true)
        }
      } catch (error) {
        console.error("Error creating user_stats table:", error)
        setDbInitialized(true) // Continue anyway
      }

      // Create user_activity table if it doesn't exist
      try {
        await supabase.rpc("create_user_activity_table")
      } catch (error) {
        console.error("Error creating user_activity table:", error)
        // Continue anyway
      }
    } catch (error) {
      console.error("Error initializing database:", error)
    }
  }

  // Update the fetchUserStats function to properly initialize and fetch user stats
  const fetchUserStats = async () => {
    try {
      if (!user) return

      // First check if the database is initialized
      if (!dbInitialized) {
        await initializeDatabase()
      }

      // Fetch user stats from the API endpoint
      const response = await fetch("/api/user-stats")
      const { success, data, error } = await response.json()

      if (!success) {
        console.error("Error fetching user stats:", error)
        return
      }

      // If stats exist, update state
      if (data) {
        setCourseCount(data.course_count || 0)
        setStreak(data.current_streak || 0)
        setLongestStreak(data.longest_streak || 0)
        setHoursLearned(data.hours_learned || 0)
        setCompletedThisMonth(data.completed_this_month || 0)
        setUiuxCompleted(data.uiux_completed || false)

        // Set course progress
        setCourseProgress({
          uiux: data.uiux_progress || 0,
        })
      }

      // Fetch recent activity
      await fetchRecentActivity()
    } catch (error) {
      console.error("Error in fetchUserStats:", error)
    }
  }

  // Update the recordUserActivity function to use the API endpoint
  const recordUserActivity = async (activity_type, description) => {
    try {
      if (!user) return

      // Record the activity via API
      const response = await fetch("/api/user-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_type,
          description,
        }),
      })

      const { success, error } = await response.json()

      if (!success) {
        console.error("Error recording user activity:", error)
        return
      }

      // Refresh user stats and activity
      await fetchUserStats()
      await fetchRecentActivity()
    } catch (error) {
      console.error("Error in recordUserActivity:", error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (error) {
        console.error("Error fetching recent activity:", error)
        return
      }

      setRecentActivity(data || [])
    } catch (error) {
      console.error("Error in fetchRecentActivity:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Update the watchLecture function to properly track progress
  const watchLecture = async () => {
    try {
      // Record the activity
      await recordUserActivity("Learning", "Watched a lecture in UI/UX Design Fundamentals course")

      // Update course progress via API
      const response = await fetch("/api/course-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: "uiux",
          progressIncrement: 10,
        }),
      })

      const { success, data, error } = await response.json()

      if (!success) {
        console.error("Error updating course progress:", error)
        toast({
          title: "Progress Update Failed",
          description: "There was an error updating your progress.",
          variant: "destructive",
        })
        return
      }

      // Update local state with the new data
      setCourseProgress((prev) => ({
        ...prev,
        uiux: data.uiux_progress,
      }))
      setHoursLearned(data.hours_learned)

      // Check if course is now completed
      if (data.uiux_completed && !uiuxCompleted) {
        setUiuxCompleted(true)
        toast({
          title: "Course Completed!",
          description: "Congratulations! You've completed the UI/UX Design Fundamentals course.",
        })
      } else {
        toast({
          title: "Progress Updated",
          description: "You've made progress in the UI/UX Design Fundamentals course!",
        })
      }

      // Refresh user stats and activity
      await fetchUserStats()
      await fetchRecentActivity()
    } catch (error) {
      console.error("Error in watchLecture:", error)
      toast({
        title: "Error",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update the handleStartCourse function to redirect to the specified URL
  const handleStartCourse = async (courseName, courseKey = "uiux") => {
    try {
      // Open course URL immediately to avoid popup blockers
      window.open("https://zingy-lolly-ac55f1.netlify.app/", "_blank")

      // Record the activity
      await recordUserActivity("Course", `Started ${courseName} course`)

      // Update user stats via API
      const response = await fetch("/api/course-start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: courseKey,
        }),
      })

      const { success, data, error } = await response.json()

      if (!success) {
        console.error("Error starting course:", error)
        toast({
          title: "Error",
          description: "Failed to update course progress. Your course has been opened in a new tab.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setCourseCount(data.course_count)
      setHoursLearned(data.hours_learned)
      setCourseProgress((prev) => ({
        ...prev,
        [courseKey]: data[`${courseKey}_progress`],
      }))

      toast({
        title: "Course Started",
        description: `You've started the ${courseName} course. Good luck!`,
      })

      // Refresh user stats and activity
      await fetchUserStats()
      await fetchRecentActivity()
    } catch (error) {
      console.error("Error starting course:", error)
      toast({
        title: "Error",
        description: "Failed to update course progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add this function after handleStartCourse
  const openCoursePage = () => {
    window.open("https://zingy-lolly-ac55f1.netlify.app/", "_blank")
  }

  const handleContactMentor = (mentorName) => {
    setSelectedMentor(mentors[mentorName])
    setContactMentorModalOpen(true)
  }

  const handleOpenCurriculum = (course) => {
    setCurriculumModal({ open: true, course })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-white/80 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="absolute inset-0 flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-xl bg-black/60 border-b border-white/10">
          <div className="flex items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className="text-3xl font-bold tracking-wider"
                style={{
                  fontFamily: "'Copperplate Gothic', 'Copperplate', serif",
                  textShadow: "0 0 5px rgba(255, 0, 0, 0.3)",
                }}
              >
                <span className="text-white">RICH</span>
                <span className="text-red-600">X</span>
              </h1>
            </motion.div>
            <div className="ml-4 hidden md:block">
              <p className="text-white/70 text-sm">The Community of 1%</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 text-white/80">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium truncate max-w-[150px]">
                {profile?.full_name || user?.user_metadata?.name || user?.email}
              </span>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
              <motion.h1
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Welcome to RICH-X Learning Platform
              </motion.h1>
              <motion.p
                className="text-white/70 mb-6 sm:mb-8 text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Your personalized education journey starts here
              </motion.p>
              <motion.h2
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Mentors from
              </motion.h2>

              <LogoMarquee />

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30 cursor-pointer"
                  variants={item}
                  onClick={() => setShowProgressChart(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-white">My Progress</h2>
                    <BarChart3 className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-white mb-2">{courseCount} Courses</p>
                  <p className="text-green-400 text-xs sm:text-sm flex items-center">
                    <span className="mr-1">↑</span> {completedThisMonth} completed this month
                  </p>
                </motion.div>

                <motion.div
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30"
                  variants={item}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-white">TimeTable</h2>
                  </div>
                  <Button className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-md text-sm transition-colors">
                    Go to TimeTable{">"}
                  </Button>
                </motion.div>

                <motion.div
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30"
                  variants={item}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-white">Certificates</h2>
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-white/80 mb-2 text-xs sm:text-sm">{uiuxCompleted ? 1 : 0} certificates earned</p>
                  <p className="text-white/80 mb-3 text-xs sm:text-sm">
                    {uiuxCompleted ? "UI/UX course completed!" : "Complete the UI/UX course to earn a certificate"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-gradient-to-r from-red-600 to-red-800 border-none text-white hover:from-red-700 hover:to-red-900 text-xs sm:text-sm shadow-lg hover:shadow-red-700/20 transition-all duration-300 transform hover:scale-105 animate-pulse"
                    onClick={() => {
                      openCoursePage()
                      handleStartCourse("UI/UX Design Fundamentals")
                    }}
                  >
                    {uiuxCompleted ? "Review Course" : "Start Learning Now 👇"}
                  </Button>
                </motion.div>

                {/* Update the Account card to use the Settings icon and redirect to profile */}
                <motion.div
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30"
                  variants={item}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-white">Account</h2>
                    <Settings className="h-5 w-5 text-white cursor-pointer" onClick={() => router.push("/profile")} />
                  </div>
                  <p className="text-white/80 mb-2 text-xs sm:text-sm">Customize your profile</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-gradient-to-r from-red-600 to-red-800 border-none text-white hover:from-red-700 hover:to-red-900 text-xs sm:text-sm shadow-lg hover:shadow-red-700/20 transition-all duration-300 transform hover:scale-105"
                    onClick={() => router.push("/profile")}
                  >
                    Profile Settings
                  </Button>
                </motion.div>
              </motion.div>

              {/* Courses Section */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" /> My Courses
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* UI/UX Course Card */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30 flex flex-col">
                    <div className="h-40 bg-gradient-to-r from-red-900/40 to-black relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Palette className="h-16 w-16 text-white/30" />
                      </div>
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1">UI/UX Design Fundamentals</h3>
                      <p className="text-white/70 text-sm mb-3">
                        Master the principles of user interface and experience design
                      </p>
                      <div className="flex items-center text-xs text-white/60 mb-2">
                        <span className="flex items-center mr-3">
                          <FileText className="h-3 w-3 mr-1" /> 58 Lessons
                        </span>
                        <span className="flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" /> Beginner to Advanced
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-white/60 mb-2">
                        <span className="flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" /> Mentor- Sarthak Bhudija
                        </span>
                        <Button
                          variant="link"
                          className="ml-auto text-red-400 hover:text-red-300 p-0 h-auto text-xs"
                          onClick={() => handleContactMentor("sarthak")}
                        >
                          Contact
                        </Button>
                      </div>

                      {/* Course progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Progress</span>
                          <span>{courseProgress.uiux}%</span>
                        </div>
                        <div className="bg-white/10 h-2 rounded-full w-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full"
                            style={{ width: `${courseProgress.uiux}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col gap-2">
                        <Button
                          className="flex items-center justify-center w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-2 rounded-md text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-700/20"
                          onClick={() => {
                            openCoursePage()
                            handleStartCourse("UI/UX Design Fundamentals")
                          }}
                        >
                          {uiuxCompleted ? "Review Course" : "Continue Learning"}{" "}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>

                        <Button
                          className="flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-md text-sm transition-colors"
                          onClick={watchLecture}
                        >
                          Simulate Watch Lecture
                        </Button>

                        <Button
                          className="flex items-center justify-center w-full border border-white/20 bg-transparent hover:bg-white/10 text-white py-2 rounded-md text-sm transition-colors"
                          onClick={() => handleOpenCurriculum("uiux")}
                        >
                          <FileText className="mr-1 h-3 w-3" /> See Curriculum
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Web Development Course Card */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30 flex flex-col">
                    <div className="h-40 bg-gradient-to-r from-blue-900/40 to-black relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Code className="h-16 w-16 text-white/30" />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1">Web Development Bootcamp</h3>
                      <p className="text-white/70 text-sm mb-3">Full-stack development with modern frameworks</p>
                      <div className="flex items-center text-xs text-white/60 mb-2">
                        <span className="flex items-center mr-3">
                          <FileText className="h-3 w-3 mr-1" /> Advanced
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-white/60 mb-4">
                        <span className="flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" /> Mentor- Keshav Mishra
                        </span>{" "}
                        <Button
                          variant="link"
                          className="ml-auto text-red-400 hover:text-red-300 p-0 h-auto text-xs"
                          onClick={() => handleContactMentor("keshav")}
                        >
                          Contact
                        </Button>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-2 rounded-md text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-700/20">
                          Start Learning
                        </Button>

                        <Button
                          className="mt-2 flex items-center justify-center w-full border border-white/20 bg-transparent hover:bg-white/10 text-white py-2 rounded-md text-sm transition-colors"
                          onClick={() => handleOpenCurriculum("webdev")}
                        >
                          <FileText className="mr-1 h-3 w-3" /> See Curriculum
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Data Science Course Card */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:border-red-500/30 flex flex-col">
                    <div className="h-40 bg-gradient-to-r from-purple-900/40 to-black relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart3 className="h-16 w-16 text-white/30" />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-1">Graphic Designing</h3>
                      <p className="text-white/70 text-sm mb-3">
                        Be a creative expert in visual storytelling and design.
                      </p>
                      <div className="flex items-center text-xs text-white/60 mb-2">
                        <span className="flex items-center mr-3">
                          <FileText className="h-3 w-3 mr-1" /> Advanced
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-white/60 mb-4">
                        <span className="flex items-center">
                          <GraduationCap className="h-3 w-3 mr-1" /> Mentor-{" "}
                          <span className="text-red-400 font-semibold">Bhavesh Sharma</span>{" "}
                          <span className="ml-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            Founder
                          </span>
                        </span>
                        <Button
                          variant="link"
                          className="ml-auto text-red-400 hover:text-red-300 p-0 h-auto text-xs"
                          onClick={() => handleContactMentor("bhavesh")}
                        >
                          Contact
                        </Button>
                      </div>
                      <div className="mt-auto">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-2 rounded-md text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-700/20">
                          Start Learning
                        </Button>

                        <Button
                          className="mt-2 flex items-center justify-center w-full border border-white/20 bg-transparent hover:bg-white/10 text-white/50 py-2 rounded-md text-sm transition-colors cursor-not-allowed opacity-70"
                          disabled
                        >
                          <FileText className="mr-1 h-3 w-3" /> Curriculum Coming Soon
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Change "Recent Learning Activity" to "Weekly Learning Schedule" */}
              <motion.div
                className="mt-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-6 overflow-hidden relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 relative z-10 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" /> Weekly Learning Schedule
                </h2>

                <div className="space-y-3 sm:space-y-4 relative z-10">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between py-2 sm:py-3 ${index < recentActivity.length - 1 ? "border-b border-white/5" : ""}`}
                      >
                        <div>
                          <p className="text-white font-medium text-sm sm:text-base">{activity.activity_type}</p>
                          <p className="text-white/60 text-xs sm:text-sm">{activity.description}</p>
                        </div>
                        <p className="text-white/60 text-xs sm:text-sm">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-white/60">
                      <p>No activity recorded yet. Start learning to track your progress!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>

        <footer className="py-3 px-4 sm:px-6 backdrop-blur-md bg-black/60 border-t border-white/10 text-center text-white/60 text-xs sm:text-sm">
          © {new Date().getFullYear()} RICH-X: The Community of 1%. All rights reserved.
        </footer>
      </div>

      {showProgressChart && user && <ProgressChart userId={user.id} onClose={() => setShowProgressChart(false)} />}
      {activeMentor && <ContactMentorModal mentor={activeMentor} onClose={() => setActiveMentor(null)} />}
      {selectedMentor && (
        <ContactMentorModal mentor={selectedMentor} onClose={() => setContactMentorModalOpen(false)} />
      )}
      {curriculumModal.open && (
        <CurriculumModal
          course={curriculumModal.course}
          onClose={() => setCurriculumModal({ open: false, course: null })}
        />
      )}
    </div>
  )
}
