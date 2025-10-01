"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, CheckCircle, Activity, MapPin } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function DiseaseDetection() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [imageType, setImageType] = useState("X-ray")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!image) return

    setAnalyzing(true)
    try {
      const response = await fetch("/api/disease-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, imageType }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Disease detection error:", error)
      alert("Failed to analyze image. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Mild":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "Moderate":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "Severe":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "Critical":
        return "bg-red-100 text-red-900 border-red-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <ImageIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Disease Detection from Medical Images</h1>
          <p className="text-muted-foreground">Upload X-rays or medical images for AI analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Upload Medical Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              {["X-ray", "CT Scan", "MRI", "Skin Image"].map((type) => (
                <Button
                  key={type}
                  variant={imageType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer">
                {image ? (
                  <img src={image || "/placeholder.svg"} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" />
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Click to upload image</p>
                      <p className="text-sm text-muted-foreground">X-ray, CT scan, MRI, or skin image</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {image && (
              <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
                {analyzing ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  "Analyze Image"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            <Card className="border-border border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-chart-2" />
                    Primary Diagnosis
                  </CardTitle>
                  <Badge className={getSeverityColor(result.severity)}>{result.severity}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">{result.diagnosis}</span>
                    <span className="text-3xl font-bold text-primary">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-3" />
                  <p className="text-sm text-muted-foreground">Confidence Level</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Detailed Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.findings?.map((finding: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-primary text-lg">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{finding.finding}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Location:</span> {finding.location}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Significance:</span> {finding.significance}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Clinical Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {result.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-chart-2 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Follow-Up Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.followUp}</p>
              </CardContent>
            </Card>

            {result.differentialDiagnosis && result.differentialDiagnosis.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Differential Diagnosis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.differentialDiagnosis.map((diagnosis: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {diagnosis}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
