"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Phone, Video } from "lucide-react"

export default function TelemedicinePage() {
  const startJitsi = () => {
    const room = `SmolVLM-Session-${Date.now()}`
    const jitsiUrl = `https://meet.jit.si/${room}`
    try {
      window.open(jitsiUrl, "_blank")
    } catch (e) {
      window.location.href = jitsiUrl
    }
  }

  const openWhatsApp = (phone = "919579925834") => {
    const message = encodeURIComponent("Hello Doctor, I'd like to join a video consultation.")
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`
    try {
      window.open(whatsappUrl, "_blank")
    } catch (e) {
      window.location.href = whatsappUrl
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Telemedicine Video Call</h1>
        <p className="text-muted-foreground">Start a secure video consultation with your doctor.</p>
      </div>

      <div className="flex gap-3">
        <Button onClick={startJitsi} className="gap-2">
          <Video className="w-4 h-4" />
          Start Video Call
        </Button>
        <Button variant="outline" onClick={() => openWhatsApp()} className="gap-2">
          <Phone className="w-4 h-4" />
          Message on WhatsApp
        </Button>
      </div>
    </div>
  )
}
