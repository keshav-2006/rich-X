"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Mail, Phone, MessageSquare } from "lucide-react"

export default function ContactMentorModal({ mentor, onClose }) {
  const [showWhatsappConfirm, setShowWhatsappConfirm] = useState(false)
  const [showCallConfirm, setShowCallConfirm] = useState(false)

  const handleWhatsappClick = () => {
    setShowWhatsappConfirm(true)
  }

  const handleCallClick = () => {
    setShowCallConfirm(true)
  }

  const confirmWhatsapp = () => {
    window.open(`https://wa.me/${mentor.phone.replace(/\D/g, "")}`, "_blank")
    onClose()
  }

  const confirmCall = () => {
    window.open(`tel:${mentor.phone.replace(/\D/g, "")}`, "_blank")
    onClose()
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
          className="w-full max-w-md"
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
              <CardTitle className="text-2xl font-bold text-white">Contact {mentor.name}</CardTitle>
              {mentor.isFounder && (
                <div className="text-red-500 text-sm font-semibold mt-1 flex items-center">
                  <span className="mr-2">Founder of RICH-X</span>
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">Founder</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {showWhatsappConfirm ? (
                <div className="text-center py-4">
                  <h3 className="text-lg font-medium text-white mb-4">Open WhatsApp?</h3>
                  <p className="text-white/70 mb-6">You'll be redirected to WhatsApp to message {mentor.name}.</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowWhatsappConfirm(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button onClick={confirmWhatsapp} className="bg-green-600 hover:bg-green-700 text-white">
                      Open WhatsApp
                    </Button>
                  </div>
                </div>
              ) : showCallConfirm ? (
                <div className="text-center py-4">
                  <h3 className="text-lg font-medium text-white mb-4">Make a call?</h3>
                  <p className="text-white/70 mb-6">You'll be making a call to {mentor.name}.</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCallConfirm(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button onClick={confirmCall} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Call Now
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <Mail className="h-6 w-6 text-red-500" />
                    <div>
                      <div className="text-sm text-white/70">Email</div>
                      <a href={`mailto:${mentor.email}`} className="text-white hover:text-red-400 transition-colors">
                        {mentor.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <Phone className="h-6 w-6 text-red-500" />
                    <div>
                      <div className="text-sm text-white/70">Phone</div>
                      <div className="text-white">{mentor.phone}</div>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={handleCallClick}
                      >
                        <Phone className="h-4 w-4 mr-1" /> Call
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleWhatsappClick}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="border-t border-white/10 p-4 flex justify-end">
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
