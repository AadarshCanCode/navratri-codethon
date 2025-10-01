"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHome } from "@/components/dashboard-home"
import { SymptomChecker } from "@/components/symptom-checker"
import { DiseaseDetection } from "@/components/disease-detection"
import { HealthRiskPrediction } from "@/components/health-risk-prediction"
import { ReportSummarizer } from "@/components/report-summarizer"
import { DoctorAssistant } from "@/components/doctor-assistant"
import { MedicalTranscription } from "@/components/medical-transcription"
import { MentalHealth } from "@/components/mental-health"
import { WearableHealth } from "@/components/wearable-health"
import { TelemedicineBot } from "@/components/telemedicine-bot"

export default function Page() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />
      case "symptom-checker":
        return <SymptomChecker />
      case "disease-detection":
        return <DiseaseDetection />
      case "health-risk":
        return <HealthRiskPrediction />
      case "report-summarizer":
        return <ReportSummarizer />
      case "doctor-assistant":
        return <DoctorAssistant />
      case "transcription":
        return <MedicalTranscription />
      case "mental-health":
        return <MentalHealth />
      case "wearable":
        return <WearableHealth />
      case "telemedicine":
        return <TelemedicineBot />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-1 overflow-y-auto">{renderSection()}</main>
    </div>
  )
}
