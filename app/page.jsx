"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AuthForm from "@/components/auth-form"
import AnimatedBackground from "@/components/animated-background"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log("Active session found, redirecting to dashboard")
          setUser(session.user)
          router.push("/dashboard")
        } else {
          console.log("No active session found")
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")

      if (session) {
        setUser(session.user)
        router.push("/dashboard")
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignIn = async (email, password) => {
    try {
      setLoading(true)
      console.log("Starting sign in with:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if the error is about invalid credentials
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          })
        } else {
          throw error
        }
        return { success: false, error: error.message }
      }

      console.log("Sign in successful:", data)

      // Explicitly redirect to dashboard
      router.push("/dashboard")

      return { success: true, user: data.user }
    } catch (error) {
      console.error("Sign in error:", error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-white/80 text-lg font-medium">Loading RICH-X...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <AnimatedBackground centered={true} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AuthForm onSignIn={handleSignIn} />
      </div>
    </main>
  )
}
