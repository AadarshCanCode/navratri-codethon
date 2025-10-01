"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Brain, TrendingUp, Smile, Frown, Meh } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const moodHistory = [
  { date: "Mon", score: 7 },
  { date: "Tue", score: 6 },
  { date: "Wed", score: 8 },
  { date: "Thu", score: 5 },
  { date: "Fri", score: 7 },
  { date: "Sat", score: 8 },
  { date: "Sun", score: 9 },
]

export function MentalHealth() {
  const [moodInput, setMoodInput] = useState("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalysis({
        sentiment: "Positive",
        score: 7.5,
        emotions: [
          { emotion: "Happy", percentage: 45 },
          { emotion: "Calm", percentage: 30 },
          { emotion: "Anxious", percentage: 15 },
          { emotion: "Stressed", percentage: 10 },
        ],
        recommendations: [
          "Your mood shows positive trends this week",
          "Consider maintaining current stress management practices",
          "Regular exercise and sleep schedule recommended",
        ],
      })
      setAnalyzing(false)
    }, 1500)
  }

  const getSentimentIcon = () => {
    if (!analysis) return null
    if (analysis.score >= 7) return <Smile className="w-8 h-8 text-chart-2" />
    if (analysis.score >= 5) return <Meh className="w-8 h-8 text-chart-3" />
    return <Frown className="w-8 h-8 text-destructive" />
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI for Mental Health</h1>
          <p className="text-muted-foreground">Track your emotional wellbeing with AI insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Mood Check-in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="How are you feeling today? Describe your mood, thoughts, or any concerns..."
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              className="min-h-32 resize-none"
            />
            <Button onClick={handleAnalyze} disabled={!moodInput.trim() || analyzing} className="w-full">
              {analyzing ? "Analyzing..." : "Analyze Mood"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Sentiment</p>
                  <p className="text-2xl font-bold text-foreground">{analysis.sentiment}</p>
                </div>
                {getSentimentIcon()}
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Emotion Breakdown</h4>
                <div className="space-y-3">
                  {analysis.emotions.map((emotion: any) => (
                    <div key={emotion.emotion}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{emotion.emotion}</span>
                        <span className="text-sm font-medium text-primary">{emotion.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${emotion.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">Insights</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-chart-1" />
            Emotional Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis domain={[0, 10]} stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: "#0ea5e9", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
