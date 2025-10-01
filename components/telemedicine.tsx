"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Video, Send, User, Bot, Activity, Phone, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useChat } from "ai/react"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"

export function Telemedicine() {
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const [patientFirstName, setPatientFirstName] = useState("")
  const [patientLastName, setPatientLastName] = useState("")
  const [patientContext, setPatientContext] = useState({
    name: "",
    age: 0,
    conditions: [] as string[],
  })
  const [sessionSaved, setSessionSaved] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const supabase = createClient()

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/telemedicine",
    body: {
      sessionId,
      patientContext,
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    const { data: doctorsRes } = await supabase.from("doctors").select("*").order("full_name")

    if (doctorsRes && doctorsRes.length > 0) {
      setDoctors(doctorsRes)
      setSelectedDoctor(doctorsRes[0])
    }
  }

  const findOrCreatePatient = async (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`.trim()

    if (!fullName) return null

    // Try to find existing patient
    const { data: existingPatients } = await supabase.from("patients").select("*").ilike("full_name", fullName).limit(1)

    if (existingPatients && existingPatients.length > 0) {
      return existingPatients[0]
    }

    // Create new patient with minimal info
    const { data: newPatient, error } = await supabase
      .from("patients")
      .insert([
        {
          full_name: fullName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@temp.com`,
          phone: "0000000000",
          date_of_birth: "2000-01-01",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating patient:", error)
      return null
    }

    return newPatient
  }

  const startConsultation = async () => {
    if (!patientFirstName.trim() || !patientLastName.trim()) {
      alert("Please enter patient's first and last name")
      return
    }

    const patient = await findOrCreatePatient(patientFirstName, patientLastName)

    if (patient) {
      setPatientContext({
        name: patient.full_name,
        age: new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear(),
        conditions: patient.medical_history ? patient.medical_history.split(",").map((c: string) => c.trim()) : [],
      })
    } else {
      // Use basic context if patient creation failed
      setPatientContext({
        name: `${patientFirstName} ${patientLastName}`,
        age: 0,
        conditions: [],
      })
    }
  }

  const saveSession = async () => {
    if (!patientContext.name || !selectedDoctor || messages.length === 0) {
      alert("Please start a consultation and have at least one message in the conversation")
      return
    }

    try {
      // Find or create patient
      const patient = await findOrCreatePatient(patientFirstName, patientLastName)

      if (!patient) {
        alert("Failed to save session: Could not create patient record")
        return
      }

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      }))

      const { error } = await supabase.from("telemedicine_sessions").insert([
        {
          patient_id: patient.id,
          doctor_id: selectedDoctor.id,
          conversation_history: conversationHistory,
          status: "completed",
          session_end: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setSessionSaved(true)
      alert("Session saved successfully!")
    } catch (error) {
      console.error("Error saving session:", error)
      alert("Failed to save session")
    }
  }

  const startWhatsAppCall = () => {
    const phoneNumber = "919579925834"
    const message = encodeURIComponent(
      `Hello Doctor, I would like to start a video consultation. Patient: ${patientContext.name || "Not specified"}`,
    )
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    // Use window.location.href for mobile app detection, fallback to window.open for desktop
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = whatsappUrl
    } else {
      window.open(whatsappUrl, "_blank")
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Telemedicine Consultation</h1>
          <p className="text-muted-foreground">Virtual consultation with AI-powered medical assistant</p>
        </div>
      </div>

      {doctors.length === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                No doctors available. Please add a doctor profile in the Doctor Assistant tab first.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <select
                className="w-full p-2 rounded-md border border-border bg-background"
                value={selectedDoctor?.id || ""}
                onChange={(e) => {
                  const doctor = doctors.find((d) => d.id === e.target.value)
                  if (doctor) setSelectedDoctor(doctor)
                }}
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} - {d.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Patient First Name</Label>
              <Input
                placeholder="John"
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
                disabled={patientContext.name !== ""}
              />
            </div>

            <div className="space-y-2">
              <Label>Patient Last Name</Label>
              <Input
                placeholder="Doe"
                value={patientLastName}
                onChange={(e) => setPatientLastName(e.target.value)}
                disabled={patientContext.name !== ""}
              />
            </div>

            {!patientContext.name && (
              <Button className="w-full" onClick={startConsultation}>
                Start Consultation
              </Button>
            )}

            {patientContext.name && (
              <>
                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-semibold text-foreground">{patientContext.name}</p>
                </div>
                {patientContext.age > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-semibold text-foreground">{patientContext.age} years</p>
                  </div>
                )}
                {patientContext.conditions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Conditions</p>
                    <div className="space-y-1">
                      {patientContext.conditions.map((condition, i) => (
                        <Badge key={i} variant="outline" className="block w-fit">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 border-t border-border space-y-2">
              <Button className="w-full gap-2" onClick={startWhatsAppCall}>
                <Phone className="w-4 h-4" />
                Start WhatsApp Video Call
              </Button>
              <Button
                className="w-full gap-2 bg-transparent"
                variant="outline"
                onClick={saveSession}
                disabled={sessionSaved || !patientContext.name || !selectedDoctor}
              >
                <Save className="w-4 h-4" />
                {sessionSaved ? "Session Saved" : "Save Session"}
              </Button>
              {messages.length > 0 && (
                <div className="flex items-center gap-2 text-sm justify-center pt-2">
                  <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                  <span className="text-muted-foreground">Session Active</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border flex flex-col" style={{ height: "600px" }}>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Consultation Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  {patientContext.name
                    ? "Start your consultation by describing your symptoms or concerns"
                    : "Please enter patient name and start consultation to begin"}
                </p>
              </div>
            )}

            {messages.map((message, i) => (
              <div key={i} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>
          <div className="border-t border-border p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  patientContext.name
                    ? "Describe your symptoms or ask a question..."
                    : "Please start consultation first"
                }
                className="flex-1"
                disabled={isLoading || !patientContext.name}
              />
              <Button type="submit" disabled={isLoading || !input.trim() || !patientContext.name}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
