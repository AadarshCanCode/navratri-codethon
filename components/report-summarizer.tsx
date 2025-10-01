"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileText,
  Download,
  Sparkles,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  Pill,
  ClipboardList,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ReportSummarizer() {
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setSummary(null)
    }
  }

  const handleProcess = async () => {
    if (!file) return

    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/summarize-report", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to summarize report")
      }

      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error("[v0] Error summarizing report:", error)
      alert("Failed to summarize report. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Smart Medical Report Summarizer</h1>
          <p className="text-muted-foreground">Upload medical reports for AI-powered simplification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upload Medical Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file ? file.name : "Click to upload report"}</p>
                    <p className="text-sm text-muted-foreground">PDF, JPG, or PNG format</p>
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <Button onClick={handleProcess} disabled={processing} className="w-full gap-2">
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Summarize Report
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {summary && (
          <Card className="border-border lg:col-span-2">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Medical Report Summary
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Patient Name</p>
                    <p className="font-semibold text-foreground">{summary.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Report Date</p>
                    <p className="font-semibold text-foreground">{summary.date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Key Findings</h3>
                  </div>
                  <div className="space-y-2">
                    {summary.keyFindings?.map((finding: string, i: number) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Diagnosis</h3>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{summary.diagnosis}</p>
                  </div>

                  {summary.medications && summary.medications.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Pill className="w-5 h-5 text-chart-2" />
                        <h3 className="text-lg font-semibold text-foreground">Prescribed Medications</h3>
                      </div>
                      <div className="space-y-2">
                        {summary.medications.map((med: string, i: number) => (
                          <div key={i} className="flex gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                            <Badge variant="secondary" className="bg-chart-2/20 text-chart-2 hover:bg-chart-2/30">
                              {i + 1}
                            </Badge>
                            <span className="text-sm text-foreground">{med}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-5 rounded-lg bg-chart-2/5 border border-chart-2/20">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-chart-2" />
                  Medical Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.recommendations?.map((rec: string, i: number) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-background border border-chart-2/20">
                      <div className="w-5 h-5 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-chart-2">✓</span>
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
