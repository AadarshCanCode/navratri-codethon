"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Stethoscope, AlertCircle, Activity, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const mockDiagnoses = [
  { condition: "Common Cold", probability: 78, severity: "low" },
  { condition: "Seasonal Allergies", probability: 65, severity: "low" },
  { condition: "Flu (Influenza)", probability: 45, severity: "medium" },
  { condition: "Sinusitis", probability: 32, severity: "medium" },
  { condition: "COVID-19", probability: 28, severity: "high" },
]

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/symptom-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Symptom analysis error:", error)
      alert("Failed to analyze symptoms. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-chart-2 bg-chart-2/10"
      case "medium":
        return "text-chart-3 bg-chart-3/10"
      case "high":
        return "text-destructive bg-destructive/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "routine":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "soon":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "urgent":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "emergency":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Symptom Checker</h1>
          <p className="text-muted-foreground">Describe your symptoms for AI-powered analysis</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Enter Your Symptoms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your symptoms in detail... (e.g., fever, headache, cough, fatigue, duration, severity)"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-32 resize-none"
          />
          <Button onClick={handleAnalyze} disabled={!symptoms.trim() || loading} className="w-full">
            {loading ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              "Analyze Symptoms"
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          <Card className="border-border border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analysis Results</CardTitle>
                <Badge className={getUrgencyColor(results.urgencyLevel)}>{results.urgencyLevel.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {results.conditions?.map((diagnosis: any, index: number) => (
                <Card key={index} className="border-border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-foreground">{diagnosis.condition}</span>
                          <Badge className={getSeverityColor(diagnosis.severity)}>{diagnosis.severity}</Badge>
                        </div>
                        <span className="text-3xl font-bold text-primary">{diagnosis.probability}%</span>
                      </div>
                      <Progress value={diagnosis.probability} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.description}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Recommendations</h4>
                      <ul className="space-y-2">
                        {diagnosis.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="text-primary font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    General Medical Advice
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{results.generalAdvice}</p>
                </CardContent>
              </Card>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Medical Disclaimer</p>
                  <p className="text-sm text-amber-800 mt-1">
                    This AI analysis is for informational purposes only. Please consult a healthcare professional for
                    proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
