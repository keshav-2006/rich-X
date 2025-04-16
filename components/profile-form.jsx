"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ProfileForm({ user, profile, onUpdateProfile }) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [setupError, setSetupError] = useState(null)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || user?.user_metadata?.name || "",
    username: profile?.username || "",
    avatar_url: profile?.avatar_url || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
  })
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if profiles table exists and try to set it up if needed
    const setupProfilesTable = async () => {
      try {
        const response = await fetch("/api/setup-db")
        const data = await response.json()

        if (!data.success) {
          setSetupError(data.error || "Failed to set up profiles table")
        }
      } catch (error) {
        console.error("Error setting up profiles table:", error)
        setSetupError("Failed to set up profiles table. Please try again later.")
      }
    }

    setupProfilesTable()
  }, [])

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || user?.user_metadata?.name || "",
        username: profile.username || "",
        avatar_url: profile.avatar_url || "",
        bio: profile.bio || "",
        website: profile.website || "",
        location: profile.location || "",
        phone: profile.phone || "",
      })
    }
  }, [profile, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // Update the handleFileChange function to fix the avatar upload issue
  const handleFileChange = async (e) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      setUploadLoading(true)

      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Check if storage bucket exists and create it if needed
      try {
        // First, check if the bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

        if (bucketsError) {
          console.error("Error listing buckets:", bucketsError)
        }

        // Check if 'avatars' bucket exists
        const bucketExists = buckets?.some((bucket) => bucket.name === "avatars")

        if (!bucketExists) {
          // Create the bucket if it doesn't exist
          const { error: createBucketError } = await supabase.storage.createBucket("avatars", {
            public: true,
          })

          if (createBucketError) {
            console.error("Error creating bucket:", createBucketError)
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error)
        // Continue anyway as the bucket might exist but not be visible to the current user
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      // Update form data with new avatar URL
      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }))

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      })
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your image. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate username if provided
      if (formData.username) {
        // Check if username is already taken by another user
        const { data: existingUser, error: usernameError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", formData.username)
          .neq("id", user.id) // Exclude current user
          .single()

        if (existingUser) {
          toast({
            title: "Username Already Taken",
            description: "Please choose a different username.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const result = await onUpdateProfile(formData)

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    const name = formData.full_name || user?.email || ""
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="backdrop-blur-xl bg-black/80 border border-white/10 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Your Profile</CardTitle>
        <CardDescription>Customize your personal information and preferences</CardDescription>
        {setupError && (
          <div className="mt-2 p-3 bg-red-900/30 border border-red-500/30 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-sm font-medium">Database Setup Error</p>
              <p className="text-red-300/70 text-xs mt-1">{setupError}</p>
              <p className="text-red-300/70 text-xs mt-1">
                You may need to create the profiles table manually in the Supabase dashboard.
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group" onClick={handleAvatarClick}>
              <Avatar className="h-24 w-24 border-2 border-white/10 cursor-pointer group-hover:opacity-80 transition-opacity">
                {uploadLoading ? (
                  <div className="h-full w-full flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                ) : (
                  <>
                    <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                    <AvatarFallback className="bg-secondary text-white text-xl">{getInitials()}</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadLoading}
              />
            </div>
            <div className="text-sm text-white/60">Click to upload a profile picture</div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-white text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-white text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-white text-sm font-medium">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
                className="bg-black/50 border-white/10 text-white min-h-[80px] rounded-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-white text-sm font-medium">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-white text-sm font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white text-sm font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (123) 456-7890"
                value={formData.phone}
                onChange={handleChange}
                className="bg-black/50 border-white/10 text-white h-10 rounded-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-white text-sm font-medium">Email Address</Label>
              <Input
                value={user?.email}
                disabled
                className="bg-black/50 border-white/10 text-white/70 h-10 rounded-sm"
              />
              <p className="text-xs text-white/50">Email cannot be changed. Contact support for assistance.</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-red-600 hover:bg-red-700 rounded-sm text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving changes...
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
