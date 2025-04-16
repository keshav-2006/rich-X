"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AnimatedBackground from "@/components/animated-background"
import ProfileForm from "@/components/profile-form"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        if (sessionError) throw sessionError

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
      } catch (error) {
        console.error("Error getting user or profile:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/")
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const updateProfile = async (updatedProfile) => {
    try {
      setLoading(true)

      const updates = {
        id: user.id,
        ...updatedProfile,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").upsert(updates, {
        returning: "minimal",
        onConflict: "id",
      })

      if (error) throw error

      setProfile({ ...profile, ...updatedProfile })
      return { success: true }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-red-600" />
          <p className="text-white/80 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="absolute inset-0 flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-xl bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/dashboard")} variant="ghost" className="text-white" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              className="text-2xl font-bold tracking-wider"
              style={{
                fontFamily: "'Copperplate Gothic', 'Copperplate', serif",
                textShadow: "0 0 5px rgba(255, 0, 0, 0.3)",
              }}
            >
              <span className="text-white">RICH</span>
              <span className="text-red-600">X</span>
            </h1>
          </motion.div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="max-w-xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <ProfileForm user={user} profile={profile} onUpdateProfile={updateProfile} />
            </motion.div>
          </div>
        </main>

        <footer className="py-3 px-4 sm:px-6 backdrop-blur-md bg-black/60 border-t border-white/10 text-center text-white/60 text-xs sm:text-sm">
          © {new Date().getFullYear()} RICHX. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
