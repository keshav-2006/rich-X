"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, X, Download, Award, BarChart3, Clock, Calendar, Trophy } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Chart from "chart.js/auto"
import { useToast } from "@/components/ui/use-toast"

export default function ProgressChart({ userId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [certificateLoading, setCertificateLoading] = useState(false)
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true)

        // Fetch user stats from the API
        const response = await fetch("/api/user-stats")
        const { success, data, error } = await response.json()

        if (!success) {
          console.error("Error fetching user stats:", error)
          return
        }

        setStats(
          data || {
            course_count: 0,
            current_streak: 0,
            longest_streak: 0,
            hours_learned: 0,
            completed_this_month: 0,
            uiux_completed: false,
            uiux_progress: 0,
          },
        )

        // Create chart after stats are loaded
        setTimeout(() => {
          createChart(data)
        }, 100)
      } catch (error) {
        console.error("Error in fetchUserStats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()

    return () => {
      // Cleanup chart on unmount
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [userId, supabase])

  const createChart = (stats) => {
    if (!chartRef.current) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")

    // Default data if stats are empty
    const courseCount = stats?.course_count || 0
    const hoursLearned = stats?.hours_learned || 0
    const completedThisMonth = stats?.completed_this_month || 0
    const currentStreak = stats?.current_streak || 0

    // Calculate progress percentage (assuming 10 courses is 100%)
    const progressPercentage = Math.min((courseCount / 10) * 100, 100)
    const remainingPercentage = 100 - progressPercentage

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Remaining"],
        datasets: [
          {
            data: [progressPercentage, remainingPercentage],
            backgroundColor: ["rgba(255, 0, 0, 0.8)", "rgba(255, 255, 255, 0.1)"],
            borderColor: ["rgba(255, 0, 0, 1)", "rgba(255, 255, 255, 0.2)"],
            borderWidth: 1,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        cutout: "75%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw.toFixed(1)}%`,
            },
          },
        },
      },
    })
  }

  const generateCertificate = async () => {
    try {
      // Check if the user has completed the UI/UX course
      if (!stats?.uiux_completed) {
        toast({
          title: "Certificate Not Available",
          description: "You need to complete the UI/UX Design Fundamentals course to download a certificate.",
          variant: "destructive",
        })
        return
      }

      setCertificateLoading(true)

      // Simulate certificate generation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create a canvas for the certificate
      const canvas = document.createElement("canvas")
      canvas.width = 1200
      canvas.height = 900
      const ctx = canvas.getContext("2d")

      // Background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Border
      ctx.strokeStyle = "#ff0000"
      ctx.lineWidth = 15
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

      // Inner border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
      ctx.lineWidth = 2
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)

      // Title
      ctx.font = "bold 60px Copperplate Gothic"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 150)

      // RICH-X Logo
      ctx.font = "bold 80px Copperplate Gothic"
      ctx.fillText("RICH", canvas.width / 2 - 60, 250)
      ctx.fillStyle = "#ff0000"
      ctx.fillText("X", canvas.width / 2 + 100, 250)

      // Subtitle
      ctx.font = "30px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("The Community of 1%", canvas.width / 2, 300)

      // Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(300, 350)
      ctx.lineTo(900, 350)
      ctx.stroke()

      // Certificate text
      ctx.font = "30px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("This certifies that", canvas.width / 2, 420)

      // Name
      ctx.font = "bold 50px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(stats?.name || "Student Name", canvas.width / 2, 500)

      // Course completion text
      ctx.font = "30px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("has successfully completed the course", canvas.width / 2, 570)

      // Course name
      ctx.font = "bold 40px Arial"
      ctx.fillStyle = "#ff0000"
      ctx.fillText("UI/UX Design Fundamentals", canvas.width / 2, 640)

      // Date
      const today = new Date()
      const dateString = today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      ctx.font = "25px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(`Issued on ${dateString}`, canvas.width / 2, 720)

      // Signature line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(400, 800)
      ctx.lineTo(800, 800)
      ctx.stroke()

      // Signature text
      ctx.font = "20px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.fillText("RICH-X Education Director", canvas.width / 2, 830)

      // Convert to data URL and trigger download
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = "RICHX-Certificate.png"
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast({
        title: "Certificate Generation Failed",
        description: "There was an error generating your certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCertificateLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-black/90 border border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="relative border-b border-white/10 pb-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-red-500" /> My Learning Progress
              </CardTitle>
              <CardDescription>Detailed overview of your learning journey</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600 mb-4" />
                  <p className="text-white/70">Loading your progress data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64">
                      <canvas ref={chartRef} className="w-full h-full" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{stats?.course_count || 0}</span>
                        <span className="text-white/70 text-sm">Courses</span>
                      </div>
                    </div>

                    <div className="mt-6 w-full">
                      <h3 className="text-lg font-semibold text-white mb-4">Course Completion</h3>
                      <div className="bg-white/10 h-2 rounded-full w-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full"
                          style={{ width: `${Math.min(((stats?.course_count || 0) / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-white/70">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* UI/UX Course Progress */}
                    <div className="mt-6 w-full">
                      <h3 className="text-lg font-semibold text-white mb-4">UI/UX Course Progress</h3>
                      <div className="bg-white/10 h-2 rounded-full w-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full"
                          style={{ width: `${stats?.uiux_progress || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-white/70">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                      <div className="mt-2 text-xs text-white/70 text-center">
                        {stats?.uiux_completed
                          ? "Course completed! You can download your certificate."
                          : `${stats?.uiux_progress || 0}% complete - Keep learning to earn your certificate!`}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Learning Statistics</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="text-white font-medium">Hours Learned</h4>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.hours_learned?.toFixed(1) || "0.0"}</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="text-white font-medium">Current Streak</h4>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.current_streak || 0} days</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center mb-2">
                          <Trophy className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="text-white font-medium">Longest Streak</h4>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.longest_streak || 0} days</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center mb-2">
                          <Award className="h-5 w-5 text-red-500 mr-2" />
                          <h4 className="text-white font-medium">Completed This Month</h4>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.completed_this_month || 0}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Course Certificate</h3>
                      <p className="text-white/70 text-sm mb-4">
                        {stats?.uiux_completed
                          ? "Congratulations! You've completed the UI/UX Design Fundamentals course. Download your certificate below."
                          : "Complete the UI/UX Design Fundamentals course to earn a certificate."}
                      </p>
                      <Button
                        onClick={generateCertificate}
                        disabled={certificateLoading || !stats?.uiux_completed}
                        className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                      >
                        {certificateLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Certificate...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download Certificate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-white/10 p-4 flex justify-between">
              <p className="text-white/60 text-xs">Keep learning to unlock more achievements and certificates!</p>
              <Button variant="ghost" className="text-white/70 hover:text-white" onClick={onClose}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
