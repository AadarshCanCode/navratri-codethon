"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Mic,
  FileAudio,
  CheckCircle,
  Loader2,
  User,
  Calendar,
  Stethoscope,
  Pill,
  ClipboardCheck,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MedicalTranscription() {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setTranscription(null)
    }
  }

  const handleTranscribe = async () => {
    if (!file) return

    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to transcribe audio")
      }

      const data = await response.json()
      setTranscription(data)
    } catch (error) {
      console.error("[v0] Error transcribing audio:", error)
      alert("Failed to transcribe audio. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Mic className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Transcription & Insights</h1>
          <p className="text-muted-foreground">Convert doctor-patient conversations to structured notes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upload Audio Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="audio-upload" />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    {file ? (
                      <FileAudio className="w-8 h-8 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file ? file.name : "Click to upload audio"}</p>
                    <p className="text-sm text-muted-foreground">MP3, WAV, or M4A format</p>
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <Button onClick={handleTranscribe} disabled={processing} className="w-full">
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  "Transcribe & Analyze"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {transcription && (
          <Card className="border-border lg:col-span-2">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-chart-2" />
                  Clinical Documentation
                </CardTitle>
                <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                  AI Generated
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="font-semibold text-foreground">{transcription.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Visit Date</p>
                    <p className="font-semibold text-foreground">{transcription.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold text-foreground">{transcription.duration || "15 min"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Chief Complaint</h3>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{transcription.chiefComplaint}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                      Reported Symptoms
                    </h3>
                    <div className="space-y-2">
                      {transcription.symptoms?.map((symptom: string, i: number) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-primary">{i + 1}</span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{symptom}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-lg bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-2 border-chart-1/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                        Diagnosis
                      </Badge>
                    </div>
                    <p className="text-base text-foreground font-medium leading-relaxed">{transcription.diagnosis}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Pill className="w-5 h-5 text-chart-2" />
                      <h3 className="text-lg font-semibold text-foreground">Treatment Plan</h3>
                    </div>
                    <div className="space-y-2">
                      {transcription.medications?.map((med: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20"
                        >
                          <Badge variant="secondary" className="bg-chart-2/30 text-chart-2 hover:bg-chart-2/40 mt-0.5">
                            Rx {i + 1}
                          </Badge>
                          <span className="text-sm text-foreground leading-relaxed flex-1">{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Follow-up Instructions</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{transcription.followUp}</p>
                  </div>
                </div>
              </div>

              {transcription.fullTranscript && (
                <div className="mt-6 p-5 rounded-lg bg-muted/30 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-muted-foreground" />
                    Full Transcript
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {transcription.fullTranscript}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
