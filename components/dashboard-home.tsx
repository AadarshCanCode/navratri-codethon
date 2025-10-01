"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { createBrowserClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DashboardStats {
  totalPatients: number
  appointmentsToday: number
  activeCases: number
  criticalAlerts: number
}

interface PatientTrend {
  month: string
  patients: number
}

interface AppointmentCount {
  day: string
  count: number
}

interface DiseaseData {
  name: string
  value: number
  color: string
}

interface RecentActivity {
  name: string
  action: string
  time: string
  status: string
}

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    appointmentsToday: 0,
    activeCases: 0,
    criticalAlerts: 0,
  })
  const [patientTrendData, setPatientTrendData] = useState<PatientTrend[]>([])
  const [appointmentData, setAppointmentData] = useState<AppointmentCount[]>([])
  const [diseaseDistribution, setDiseaseDistribution] = useState<DiseaseData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createBrowserClient()

      try {
        const { count: patientsCount } = await supabase.from("patients").select("*", { count: "exact", head: true })

        const today = new Date().toISOString().split("T")[0]
        const { count: todayAppointments } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("appointment_date", today)

        const { count: activeCases } = await supabase
          .from("consultations")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")

        const { count: criticalAlerts } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("status", "urgent")

        setStats({
          totalPatients: patientsCount || 0,
          appointmentsToday: todayAppointments || 0,
          activeCases: activeCases || 0,
          criticalAlerts: criticalAlerts || 0,
        })

        const { data: patients } = await supabase
          .from("patients")
          .select("created_at")
          .order("created_at", { ascending: true })

        if (patients) {
          const monthlyData = calculateMonthlyTrend(patients)
          setPatientTrendData(monthlyData)
        }

        const { data: appointments } = await supabase
          .from("appointments")
          .select("appointment_date")
          .gte("appointment_date", getDateDaysAgo(7))
          .order("appointment_date", { ascending: true })

        if (appointments) {
          const weeklyData = calculateWeeklyAppointments(appointments)
          setAppointmentData(weeklyData)
        }

        const { data: patientsWithHistory } = await supabase
          .from("patients")
          .select("medical_history")
          .not("medical_history", "is", null)

        if (patientsWithHistory) {
          const diseases = calculateDiseaseDistribution(patientsWithHistory)
          setDiseaseDistribution(diseases)
        }

        const { data: recentConsultations } = await supabase
          .from("consultations")
          .select(`
            id,
            created_at,
            status,
            patients (name)
          `)
          .order("created_at", { ascending: false })
          .limit(4)

        if (recentConsultations) {
          const activities = recentConsultations.map((consultation: any) => ({
            name: consultation.patients?.name || "Unknown Patient",
            action: `Consultation ${consultation.status}`,
            time: getTimeAgo(consultation.created_at),
            status: consultation.status === "completed" ? "success" : "info",
          }))
          setRecentActivity(activities)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const calculateMonthlyTrend = (patients: any[]): PatientTrend[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    const monthlyCount: { [key: string]: number } = {}

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      monthlyCount[months[monthIndex]] = 0
    }

    patients.forEach((patient) => {
      const date = new Date(patient.created_at)
      const monthName = months[date.getMonth()]
      if (monthlyCount.hasOwnProperty(monthName)) {
        monthlyCount[monthName]++
      }
    })

    let cumulative = 0
    return Object.entries(monthlyCount).map(([month, count]) => {
      cumulative += count
      return { month, patients: cumulative }
    })
  }

  const calculateWeeklyAppointments = (appointments: any[]): AppointmentCount[] => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dailyCount: { [key: string]: number } = {}

    days.forEach((day) => {
      dailyCount[day] = 0
    })

    appointments.forEach((appointment) => {
      const date = new Date(appointment.appointment_date)
      const dayName = days[date.getDay()]
      dailyCount[dayName]++
    })

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      day,
      count: dailyCount[day] || 0,
    }))
  }

  const calculateDiseaseDistribution = (patients: any[]): DiseaseData[] => {
    const diseaseCount: { [key: string]: number } = {}
    const colors = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"]

    patients.forEach((patient) => {
      if (patient.medical_history) {
        const history = patient.medical_history.toLowerCase()
        if (history.includes("diabetes")) diseaseCount["Diabetes"] = (diseaseCount["Diabetes"] || 0) + 1
        if (history.includes("hypertension") || history.includes("blood pressure"))
          diseaseCount["Hypertension"] = (diseaseCount["Hypertension"] || 0) + 1
        if (history.includes("respiratory") || history.includes("asthma"))
          diseaseCount["Respiratory"] = (diseaseCount["Respiratory"] || 0) + 1
        if (history.includes("cardiac") || history.includes("heart"))
          diseaseCount["Cardiac"] = (diseaseCount["Cardiac"] || 0) + 1
        if (history.includes("arthritis") || history.includes("joint"))
          diseaseCount["Arthritis"] = (diseaseCount["Arthritis"] || 0) + 1
      }
    })

    const total = Object.values(diseaseCount).reduce((sum, count) => sum + count, 0)
    if (total === 0) return []

    return Object.entries(diseaseCount)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  const getDateDaysAgo = (days: number): string => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split("T")[0]
  }

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  const statsData = [
    {
      label: "Total Patients",
      value: stats.totalPatients.toString(),
      change: "+12%",
      icon: Users,
      color: "text-chart-1",
    },
    {
      label: "Appointments Today",
      value: stats.appointmentsToday.toString(),
      change: `+${stats.appointmentsToday}`,
      icon: Calendar,
      color: "text-chart-2",
    },
    {
      label: "Active Cases",
      value: stats.activeCases.toString(),
      change: `${stats.activeCases} active`,
      icon: Activity,
      color: "text-chart-3",
    },
    {
      label: "Critical Alerts",
      value: stats.criticalAlerts.toString(),
      change: stats.criticalAlerts > 0 ? "Needs attention" : "All clear",
      icon: AlertCircle,
      color: "text-destructive",
    },
  ]

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Healthcare Dashboard</h1>
          <p className="text-muted-foreground">Loading your health overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <div className="h-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Healthcare Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your health overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.28 }}
            >
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                      <p className={cn("text-sm mt-2", stat.color)}>{stat.change}</p>
                    </div>
                    <div className={cn("p-3 rounded-lg bg-muted", stat.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-1" />
              Patient Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientTrendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No patient data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={patientTrendData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorPatients)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-chart-2" />
              Weekly Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentData.every((d) => d.count === 0) ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No appointments scheduled this week
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle>Recent Patient Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No recent activity to display</div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{activity.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Disease Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {diseaseDistribution.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No disease data available
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={diseaseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {diseaseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {diseaseDistribution.map((disease) => (
                    <div key={disease.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: disease.color }} />
                        <span className="text-sm text-foreground">{disease.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{disease.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
