import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, Moon, Footprints, AlertTriangle, TrendingUp } from "lucide-react"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

const heartRateData = [
  { time: "00:00", bpm: 62 },
  { time: "04:00", bpm: 58 },
  { time: "08:00", bpm: 72 },
  { time: "12:00", bpm: 85 },
  { time: "16:00", bpm: 78 },
  { time: "20:00", bpm: 68 },
  { time: "23:59", bpm: 64 },
]

const activityData = [
  { hour: "6am", steps: 120 },
  { hour: "9am", steps: 850 },
  { hour: "12pm", steps: 1200 },
  { hour: "3pm", steps: 980 },
  { hour: "6pm", steps: 1500 },
  { hour: "9pm", steps: 450 },
]

export function WearableHealth() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Activity className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wearable Health AI</h1>
          <p className="text-muted-foreground">Real-time health monitoring and anomaly detection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Heart Rate</p>
                <h3 className="text-3xl font-bold text-foreground">
                  72 <span className="text-lg">bpm</span>
                </h3>
                <p className="text-sm text-chart-2 mt-2">Normal</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Blood Oxygen</p>
                <h3 className="text-3xl font-bold text-foreground">
                  98 <span className="text-lg">%</span>
                </h3>
                <p className="text-sm text-chart-2 mt-2">Excellent</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Steps Today</p>
                <h3 className="text-3xl font-bold text-foreground">8,547</h3>
                <p className="text-sm text-chart-2 mt-2">+12% vs avg</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Footprints className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sleep Score</p>
                <h3 className="text-3xl font-bold text-foreground">85</h3>
                <p className="text-sm text-chart-1 mt-2">7h 32m</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <Moon className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Heart Rate (24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis domain={[50, 100]} stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Footprints className="w-5 h-5 text-green-500" />
              Activity Throughout Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="steps" stroke="#10b981" fillOpacity={1} fill="url(#colorSteps)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Anomaly Detection & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: "warning",
                title: "Irregular heartbeat detected",
                time: "2 hours ago",
                description: "Brief episode of elevated heart rate (105 bpm) during rest period",
                severity: "medium",
              },
              {
                type: "info",
                title: "Sleep quality improved",
                time: "Today",
                description: "Deep sleep increased by 18% compared to last week",
                severity: "low",
              },
              {
                type: "success",
                title: "Activity goal achieved",
                time: "1 hour ago",
                description: "Reached 10,000 steps milestone for the day",
                severity: "low",
              },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div
                  className={`p-2 rounded-lg ${
                    alert.severity === "medium"
                      ? "bg-amber-100"
                      : alert.severity === "low"
                        ? "bg-blue-100"
                        : "bg-green-100"
                  }`}
                >
                  {alert.severity === "medium" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  ) : alert.type === "success" ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{alert.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {alert.time}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
