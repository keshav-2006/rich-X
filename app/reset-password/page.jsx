"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AnimatedBackground from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    // Check if we have a hash in the URL (from the password reset email)
    const checkHash = async () => {
      const hash = window.location.hash
      if (
        hash &&
        hash
          .substring(1)
          .split("&")
          .find((param) => param.startsWith("type=recovery"))
      ) {
        // We have a recovery hash, so we're good to go
        console.log("Recovery hash found in URL")
      } else {
        // No recovery hash, redirect to home
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    checkHash()
  }, [router, toast])

  const handleResetPassword = async (e) => {
    e.preventDefault()

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully. You can now sign in with your new password.",
      })

      // Redirect to home after a delay
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error) {
      console.error("Error resetting password:", error)
      setError(error.message || "Failed to reset password. Please try again.")
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-xl bg-black/80 border border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center justify-center mb-6 mt-2"
              >
                <h1
                  className="text-5xl font-bold tracking-wider"
                  style={{
                    fontFamily: "'Copperplate Gothic', 'Copperplate', serif",
                    textShadow: "0 0 10px rgba(255, 0, 0, 0.3)",
                  }}
                >
                  <span className="text-white">RICH</span>
                  <span className="text-red-600">X</span>
                </h1>
              </motion.div>
              <CardTitle className="text-xl font-bold text-white">Reset Your Password</CardTitle>
              <CardDescription>Enter your new password below</CardDescription>
            </CardHeader>

            <CardContent className="px-6 pt-4 pb-6">
              {success ? (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="rounded-full bg-green-500/20 p-3">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-medium text-white mb-2">Password Reset Successful</h3>
                  <p className="text-white/70 mb-4">Your password has been reset successfully.</p>
                  <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 text-white">
                    Return to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-white text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        id="new-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-white text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" /> {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 bg-red-600 hover:bg-red-700 rounded-sm text-sm font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Resetting Password...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-red-400 hover:text-red-300 p-0 h-auto"
                      onClick={() => router.push("/")}
                    >
                      Return to Sign In
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
