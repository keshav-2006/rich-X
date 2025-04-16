"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AtSign, Lock, AlertCircle, Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AuthForm({ onSignIn }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)

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
      document.head.removeChild(style)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      console.log("Attempting to sign in with email:", formData.email)

      const result = await onSignIn(formData.email, formData.password)

      console.log("Authentication result:", result)

      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })
        // No need to redirect here as the onAuthStateChange in page.jsx will handle it
      } else {
        const errorMessage = result.error || "Authentication failed"

        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      setErrors({ email: "Please enter your email address" })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password.",
      })
    } catch (error) {
      console.error("Password reset error:", error)
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[360px] sm:max-w-md"
    >
      <Card className="backdrop-blur-xl bg-black/80 border border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="pb-4 flex flex-col items-center">
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
          <h2 className="text-xl font-semibold text-white mb-2">The Community of 1%</h2>
        </CardHeader>

        <CardContent className="px-6 pt-4 pb-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="text-white text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                    autoComplete="email"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs flex items-center mt-1"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" /> {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signin-password" className="text-white text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                    autoComplete="current-password"
                  />
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs flex items-center mt-1"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" /> {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-right">
                <a href="#" className="text-xs text-red-400 hover:text-red-300" onClick={handleForgotPassword}>
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-red-600 hover:bg-red-700 rounded-sm text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 px-6 py-4">
          <p className="text-center text-white/60 text-xs">
            By signing in, you agree to our{" "}
            <a href="#" className="text-red-400 hover:text-red-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-red-400 hover:text-red-300">
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
