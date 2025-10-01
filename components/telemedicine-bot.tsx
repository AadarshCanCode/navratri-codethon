"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Bot, User, Video } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Message = {
  id: number
  sender: "user" | "bot"
  text: string
  timestamp: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: "bot",
    text: "Hello! I'm your AI health assistant. How can I help you today?",
    timestamp: "10:00 AM",
  },
]

import { useRouter } from "next/navigation"

export function TelemedicineBot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const router = useRouter()

  const startWhatsAppAndRedirect = (doctorName?: string, phoneNumber = "919579925834") => {
    const message = encodeURIComponent(
      `Hello Doctor, I would like to start a video consultation. Patient: ${doctorName || "Not specified"}`,
    )
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    // Open WhatsApp in new tab and navigate to telemedicine UI
    try {
      window.open(whatsappUrl, "_blank")
    } catch (e) {
      // fallback
      window.location.href = whatsappUrl
    }

    // Navigate to the telemedicine page in the app
    router.push("/telemedicine")
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, userMessage])
    setInput("")

    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        sender: "bot",
        text: getBotResponse(input),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const getBotResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase()
    if (lower.includes("fever") || lower.includes("temperature")) {
      return "I understand you have a fever. For temperatures above 100.4°F (38°C), I recommend rest, hydration, and over-the-counter fever reducers. If it persists for more than 3 days or exceeds 103°F, please consult a doctor. Would you like me to connect you with a physician?"
    }
    if (lower.includes("headache") || lower.includes("pain")) {
      return "Headaches can have various causes. Try resting in a quiet, dark room and staying hydrated. Over-the-counter pain relievers may help. If severe or persistent, I can schedule you with a neurologist. Would you like to book an appointment?"
    }
    if (lower.includes("appointment") || lower.includes("doctor")) {
      return "I can help you schedule an appointment with a healthcare provider. Based on your symptoms, I recommend seeing a general practitioner. Available slots are tomorrow at 2 PM or Friday at 10 AM. Which works better for you?"
    }
    return "Thank you for sharing that information. Based on your symptoms, I recommend consulting with a healthcare professional for a proper evaluation. Would you like me to connect you with a doctor via video call or schedule an in-person appointment?"
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Telemedicine + AI Bot</h1>
          <p className="text-muted-foreground">AI-powered triage and doctor connection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Health Assistant
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => startWhatsAppAndRedirect()}
              >
                <Video className="w-4 h-4" />
                Connect to Doctor
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className={
                          message.sender === "bot"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {message.sender === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 max-w-[80%] ${message.sender === "user" ? "items-end" : "items-start"} flex flex-col`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-card-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{message.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Describe your symptoms or ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
              onClick={() => startWhatsAppAndRedirect()}
            >
              <Video className="w-4 h-4" />
              Start Video Call
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
              onClick={() => startWhatsAppAndRedirect()}
            >
              <MessageSquare className="w-4 h-4" />
              Chat with Doctor
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <Bot className="w-4 h-4" />
              Symptom Checker
            </Button>

            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold text-foreground mb-3">Available Doctors</h4>
              <div className="space-y-3">
                {[
                  { name: "Dr. Sarah Chen", specialty: "General Medicine", status: "Available" },
                  { name: "Dr. Michael Ross", specialty: "Cardiology", status: "Busy" },
                  { name: "Dr. Emily Parker", specialty: "Pediatrics", status: "Available" },
                ].map((doctor, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-foreground">{doctor.name}</p>
                      <span
                        className={`w-2 h-2 rounded-full ${doctor.status === "Available" ? "bg-chart-2" : "bg-amber-500"}`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
