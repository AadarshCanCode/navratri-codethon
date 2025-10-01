"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Activity, TrendingUp, Loader2, AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function HealthRiskPrediction() {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    smoking: "",
    exercise: "",
    diet: "",
  })
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/health-risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate health risks")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("[v0] Error calculating health risks:", error)
      alert("Failed to calculate health risks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const riskData = results
    ? [
        { name: "Diabetes Risk", value: results.diabetes, color: "#ef4444" },
        { name: "Heart Attack Risk", value: results.heartAttack, color: "#f59e0b" },
        { name: "Stroke Risk", value: results.stroke, color: "#10b981" },
        {
          name: "Low Risk",
          value: Math.max(0, 100 - results.diabetes - results.heartAttack - results.stroke),
          color: "#e5e7eb",
        },
      ]
    : []

  const getRiskLevel = (value: number) => {
    if (value < 20) return { level: "Low", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
    if (value < 40)
      return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" }
    if (value < 60) return { level: "High", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" }
    return { level: "Very High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Personalized Health Risk Prediction</h1>
          <p className="text-muted-foreground">AI-powered risk assessment for chronic diseases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Health Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="35"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smoking">Smoking Status</Label>
                <Select
                  value={formData.smoking}
                  onValueChange={(value) => setFormData({ ...formData, smoking: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exercise">Exercise Frequency</Label>
                <Select
                  value={formData.exercise}
                  onValueChange={(value) => setFormData({ ...formData, exercise: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1-2">1-2 times/week</SelectItem>
                    <SelectItem value="3-4">3-4 times/week</SelectItem>
                    <SelectItem value="5+">5+ times/week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diet">Diet Quality</Label>
                <Select
                  value={formData.diet}
                  onValueChange={(value) => setFormData({ ...formData, diet: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Calculate Risk"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {results && (
          <Card className="border-border lg:col-span-2">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Comprehensive Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2">Overall Health Risk Distribution</p>
                </div>

                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border-2 ${getRiskLevel(results.diabetes).bg} ${getRiskLevel(results.diabetes).border}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/50">
                          <Activity className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Diabetes Risk</p>
                          <Badge
                            variant="secondary"
                            className={`${getRiskLevel(results.diabetes).color} bg-background/50`}
                          >
                            {getRiskLevel(results.diabetes).level}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-red-600">{results.diabetes}%</span>
                    </div>
                    <Progress value={results.diabetes} className="h-2" />
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${getRiskLevel(results.heartAttack).bg} ${getRiskLevel(results.heartAttack).border}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/50">
                          <Heart className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Heart Attack Risk</p>
                          <Badge
                            variant="secondary"
                            className={`${getRiskLevel(results.heartAttack).color} bg-background/50`}
                          >
                            {getRiskLevel(results.heartAttack).level}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-amber-600">{results.heartAttack}%</span>
                    </div>
                    <Progress value={results.heartAttack} className="h-2" />
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 ${getRiskLevel(results.stroke).bg} ${getRiskLevel(results.stroke).border}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background/50">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Stroke Risk</p>
                          <Badge
                            variant="secondary"
                            className={`${getRiskLevel(results.stroke).color} bg-background/50`}
                          >
                            {getRiskLevel(results.stroke).level}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-3xl font-bold text-purple-600">{results.stroke}%</span>
                    </div>
                    <Progress value={results.stroke} className="h-2" />
                  </div>
                </div>
              </div>

              {results.explanations && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Detailed Risk Analysis</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <h4 className="font-semibold text-red-900">Diabetes</h4>
                      </div>
                      <p className="text-sm text-red-800 leading-relaxed">{results.explanations.diabetes}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="font-semibold text-amber-900">Heart Attack</h4>
                      </div>
                      <p className="text-sm text-amber-800 leading-relaxed">{results.explanations.heartAttack}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">Stroke</h4>
                      </div>
                      <p className="text-sm text-purple-800 leading-relaxed">{results.explanations.stroke}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-2 border-chart-2/30">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-chart-2" />
                  <h3 className="text-lg font-semibold text-foreground">Personalized Action Plan</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.recommendations?.map((rec: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-lg bg-background border border-chart-2/20 hover:border-chart-2/40 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
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
