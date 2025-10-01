"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, AlertTriangle, Plus, Activity, Pill, Users, FileText, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const DoctorAssistant = () => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [consultations, setConsultations] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [drugCheck, setDrugCheck] = useState("")
  const [interaction, setInteraction] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  const [showNewDoctor, setShowNewDoctor] = useState(false)
  const [newDoctor, setNewDoctor] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    license_number: "",
    years_of_experience: "",
  })

  const [showNewPatient, setShowNewPatient] = useState(false)
  const [newPatient, setNewPatient] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    allergies: "",
    medical_history: "",
  })

  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patient_first_name: "",
    patient_last_name: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    doctor_id: "",
  })

  const [showNewConsultation, setShowNewConsultation] = useState(false)
  const [newConsultation, setNewConsultation] = useState({
    patient_first_name: "",
    patient_last_name: "",
    chief_complaint: "",
    symptoms: "",
    diagnosis: "",
    treatment_plan: "",
    doctor_id: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [appointmentsRes, patientsRes, consultationsRes, doctorsRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("*, patients(full_name), doctors(full_name)")
          .eq("appointment_date", new Date().toISOString().split("T")[0])
          .order("appointment_time"),
        supabase.from("patients").select("*").order("full_name"),
        supabase
          .from("consultations")
          .select("*, patients(full_name), doctors(full_name)")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("doctors").select("*").order("full_name"),
      ])

      if (appointmentsRes.data) setAppointments(appointmentsRes.data)
      if (patientsRes.data) setPatients(patientsRes.data)
      if (consultationsRes.data) setConsultations(consultationsRes.data)
      if (doctorsRes.data) {
        setDoctors(doctorsRes.data)
        if (doctorsRes.data.length > 0) {
          const defaultDoctorId = doctorsRes.data[0].id
          setNewAppointment((prev) => ({ ...prev, doctor_id: defaultDoctorId }))
          setNewConsultation((prev) => ({ ...prev, doctor_id: defaultDoctorId }))
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createDoctor = async () => {
    if (!newDoctor.full_name || !newDoctor.email || !newDoctor.specialization) {
      alert("Please fill in all required fields (Name, Email, Specialization)")
      return
    }

    try {
      const { error } = await supabase.from("doctors").insert([newDoctor])

      if (error) throw error

      alert("Doctor profile created successfully!")
      setShowNewDoctor(false)
      setNewDoctor({
        full_name: "",
        email: "",
        phone: "",
        specialization: "",
        license_number: "",
        years_of_experience: "",
      })
      fetchData()
    } catch (error: any) {
      console.error("Error creating doctor:", error)
      alert(`Failed to create doctor: ${error.message}`)
    }
  }

  const createPatient = async () => {
    if (!newPatient.full_name || !newPatient.email || !newPatient.phone || !newPatient.date_of_birth) {
      alert("Please fill in all required fields (Name, Email, Phone, Date of Birth)")
      return
    }

    try {
      const { error } = await supabase.from("patients").insert([newPatient])

      if (error) throw error

      alert("Patient created successfully!")
      setShowNewPatient(false)
      setNewPatient({
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        allergies: "",
        medical_history: "",
      })
      fetchData()
    } catch (error: any) {
      console.error("Error creating patient:", error)
      alert(`Failed to create patient: ${error.message}`)
    }
  }

  const findOrCreatePatient = async (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`.trim()

    // Try to find existing patient
    const { data: existingPatients } = await supabase.from("patients").select("*").ilike("full_name", fullName).limit(1)

    if (existingPatients && existingPatients.length > 0) {
      return existingPatients[0].id
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

    if (error) throw error

    // Refresh patient list
    fetchData()

    return newPatient.id
  }

  const createAppointment = async () => {
    if (
      !newAppointment.patient_first_name ||
      !newAppointment.patient_last_name ||
      !newAppointment.appointment_date ||
      !newAppointment.appointment_time
    ) {
      alert("Please fill in all required fields")
      return
    }

    if (!newAppointment.doctor_id) {
      alert("No doctor selected. Please create a doctor profile first.")
      return
    }

    try {
      const patientId = await findOrCreatePatient(newAppointment.patient_first_name, newAppointment.patient_last_name)

      const { error } = await supabase.from("appointments").insert([
        {
          patient_id: patientId,
          doctor_id: newAppointment.doctor_id,
          appointment_date: newAppointment.appointment_date,
          appointment_time: newAppointment.appointment_time,
          reason: newAppointment.reason,
          status: "scheduled",
        },
      ])

      if (error) throw error

      alert("Appointment created successfully!")
      setShowNewAppointment(false)
      const currentDoctorId = newAppointment.doctor_id
      setNewAppointment({
        patient_first_name: "",
        patient_last_name: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        doctor_id: currentDoctorId,
      })
      fetchData()
    } catch (error: any) {
      console.error("Error creating appointment:", error)
      alert(`Failed to create appointment: ${error.message}`)
    }
  }

  const createConsultation = async () => {
    if (!newConsultation.patient_first_name || !newConsultation.patient_last_name || !newConsultation.chief_complaint) {
      alert("Please fill in required fields")
      return
    }

    if (!newConsultation.doctor_id) {
      alert("No doctor selected. Please create a doctor profile first.")
      return
    }

    try {
      const patientId = await findOrCreatePatient(newConsultation.patient_first_name, newConsultation.patient_last_name)

      const { error } = await supabase.from("consultations").insert([
        {
          patient_id: patientId,
          doctor_id: newConsultation.doctor_id,
          chief_complaint: newConsultation.chief_complaint,
          symptoms: newConsultation.symptoms,
          diagnosis: newConsultation.diagnosis,
          treatment_plan: newConsultation.treatment_plan,
        },
      ])

      if (error) throw error

      alert("Consultation recorded successfully!")
      setShowNewConsultation(false)
      const currentDoctorId = newConsultation.doctor_id
      setNewConsultation({
        patient_first_name: "",
        patient_last_name: "",
        chief_complaint: "",
        symptoms: "",
        diagnosis: "",
        treatment_plan: "",
        doctor_id: currentDoctorId,
      })
      fetchData()
    } catch (error: any) {
      console.error("Error creating consultation:", error)
      alert(`Failed to record consultation: ${error.message}`)
    }
  }

  const checkInteraction = async () => {
    if (!drugCheck.trim()) return

    const medications = drugCheck
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
    if (medications.length < 2) {
      alert("Please enter at least 2 medications separated by commas")
      return
    }

    setChecking(true)
    try {
      const response = await fetch("/api/drug-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications }),
      })

      if (!response.ok) throw new Error("Check failed")

      const data = await response.json()
      setInteraction(data)
    } catch (error) {
      console.error("Drug interaction check error:", error)
      alert("Failed to check interactions. Please try again.")
    } finally {
      setChecking(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "none":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20"
      case "mild":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "moderate":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "severe":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "contraindicated":
        return "bg-red-100 text-red-900 border-red-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor's AI Assistant</h1>
          <p className="text-muted-foreground">Manage appointments, patients, and consultations</p>
        </div>
      </div>

      {!loading && doctors.length === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <UserPlus className="w-12 h-12 mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Welcome! Let's get started</h3>
                <p className="text-muted-foreground">Create your doctor profile to begin managing the system</p>
              </div>
              <Button onClick={() => setShowNewDoctor(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Doctor Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="drug-checker">Drug Checker</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Doctor Profiles
                </CardTitle>
                <Button size="sm" className="gap-2" onClick={() => setShowNewDoctor(!showNewDoctor)}>
                  <Plus className="w-4 h-4" />
                  Add Doctor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewDoctor && (
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="Dr. John Smith"
                          value={newDoctor.full_name}
                          onChange={(e) => setNewDoctor({ ...newDoctor, full_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="doctor@hospital.com"
                          value={newDoctor.email}
                          onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          placeholder="+1234567890"
                          value={newDoctor.phone}
                          onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialization *</Label>
                        <Input
                          placeholder="Cardiology, Neurology, etc."
                          value={newDoctor.specialization}
                          onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>License Number</Label>
                        <Input
                          placeholder="MED123456"
                          value={newDoctor.license_number}
                          onChange={(e) => setNewDoctor({ ...newDoctor, license_number: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          placeholder="10"
                          value={newDoctor.years_of_experience}
                          onChange={(e) => setNewDoctor({ ...newDoctor, years_of_experience: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createDoctor}>Create Doctor Profile</Button>
                      <Button variant="outline" onClick={() => setShowNewDoctor(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : doctors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No doctors added yet. Create your first doctor profile above.
                </p>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{doctor.full_name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{doctor.specialization}</Badge>
                            {doctor.years_of_experience && (
                              <Badge variant="secondary">{doctor.years_of_experience} years exp.</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {doctor.phone && <p>{doctor.phone}</p>}
                          {doctor.license_number && <p className="text-xs mt-1">License: {doctor.license_number}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today's Appointments
                </CardTitle>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowNewAppointment(!showNewAppointment)}
                  disabled={doctors.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  New Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctors.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded-lg">
                  Please add a doctor profile first.
                </div>
              )}

              {showNewAppointment && (
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Doctor</Label>
                        <select
                          className="w-full p-2 rounded-md border border-border bg-background"
                          value={newAppointment.doctor_id}
                          onChange={(e) => setNewAppointment({ ...newAppointment, doctor_id: e.target.value })}
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
                        <Label>Patient First Name *</Label>
                        <Input
                          placeholder="John"
                          value={newAppointment.patient_first_name}
                          onChange={(e) => setNewAppointment({ ...newAppointment, patient_first_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Patient Last Name *</Label>
                        <Input
                          placeholder="Doe"
                          value={newAppointment.patient_last_name}
                          onChange={(e) => setNewAppointment({ ...newAppointment, patient_last_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newAppointment.appointment_date}
                          onChange={(e) => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={newAppointment.appointment_time}
                          onChange={(e) => setNewAppointment({ ...newAppointment, appointment_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Reason</Label>
                        <Input
                          placeholder="Checkup, Follow-up, etc."
                          value={newAppointment.reason}
                          onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createAppointment}>Create Appointment</Button>
                      <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments scheduled for today</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{apt.patients?.full_name}</p>
                          <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>{apt.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{apt.reason || "General consultation"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{apt.appointment_time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Patient Records
                </CardTitle>
                <Button size="sm" className="gap-2" onClick={() => setShowNewPatient(!showNewPatient)}>
                  <Plus className="w-4 h-4" />
                  Add Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showNewPatient && (
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="John Doe"
                          value={newPatient.full_name}
                          onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          placeholder="patient@email.com"
                          value={newPatient.email}
                          onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone *</Label>
                        <Input
                          placeholder="+1234567890"
                          value={newPatient.phone}
                          onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth *</Label>
                        <Input
                          type="date"
                          value={newPatient.date_of_birth}
                          onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <select
                          className="w-full p-2 rounded-md border border-border bg-background"
                          value={newPatient.gender}
                          onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Group</Label>
                        <Input
                          placeholder="A+, B-, O+, etc."
                          value={newPatient.blood_group}
                          onChange={(e) => setNewPatient({ ...newPatient, blood_group: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Address</Label>
                        <Input
                          placeholder="123 Main St, City, State"
                          value={newPatient.address}
                          onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Emergency Contact</Label>
                        <Input
                          placeholder="Contact Name"
                          value={newPatient.emergency_contact}
                          onChange={(e) => setNewPatient({ ...newPatient, emergency_contact: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Emergency Phone</Label>
                        <Input
                          placeholder="+1234567890"
                          value={newPatient.emergency_phone}
                          onChange={(e) => setNewPatient({ ...newPatient, emergency_phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Allergies</Label>
                        <Input
                          placeholder="Penicillin, Peanuts, etc."
                          value={newPatient.allergies}
                          onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Medical History</Label>
                        <Textarea
                          placeholder="Previous conditions, surgeries, etc."
                          value={newPatient.medical_history}
                          onChange={(e) => setNewPatient({ ...newPatient, medical_history: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createPatient}>Create Patient</Button>
                      <Button variant="outline" onClick={() => setShowNewPatient(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : patients.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No patients added yet. Create your first patient above.
                </p>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient) => (
                    <div key={patient.id} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{patient.full_name}</p>
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                          <div className="flex gap-2 mt-2">
                            {patient.blood_group && <Badge variant="outline">{patient.blood_group}</Badge>}
                            {patient.gender && <Badge variant="outline">{patient.gender}</Badge>}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{patient.phone}</p>
                          {patient.allergies && <p className="text-destructive mt-1">Allergies: {patient.allergies}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Consultations
                </CardTitle>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowNewConsultation(!showNewConsultation)}
                  disabled={doctors.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  New Consultation
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctors.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded-lg">
                  Please add a doctor profile first.
                </div>
              )}

              {showNewConsultation && (
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Doctor</Label>
                        <select
                          className="w-full p-2 rounded-md border border-border bg-background"
                          value={newConsultation.doctor_id}
                          onChange={(e) => setNewConsultation({ ...newConsultation, doctor_id: e.target.value })}
                        >
                          <option value="">Select doctor</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.full_name} - {d.specialization}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Patient First Name *</Label>
                          <Input
                            placeholder="John"
                            value={newConsultation.patient_first_name}
                            onChange={(e) =>
                              setNewConsultation({ ...newConsultation, patient_first_name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Patient Last Name *</Label>
                          <Input
                            placeholder="Doe"
                            value={newConsultation.patient_last_name}
                            onChange={(e) =>
                              setNewConsultation({ ...newConsultation, patient_last_name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Chief Complaint</Label>
                        <Input
                          placeholder="Main reason for visit"
                          value={newConsultation.chief_complaint}
                          onChange={(e) => setNewConsultation({ ...newConsultation, chief_complaint: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Symptoms</Label>
                        <Textarea
                          placeholder="Describe symptoms"
                          value={newConsultation.symptoms}
                          onChange={(e) => setNewConsultation({ ...newConsultation, symptoms: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Diagnosis</Label>
                        <Textarea
                          placeholder="Medical diagnosis"
                          value={newConsultation.diagnosis}
                          onChange={(e) => setNewConsultation({ ...newConsultation, diagnosis: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Treatment Plan</Label>
                        <Textarea
                          placeholder="Recommended treatment"
                          value={newConsultation.treatment_plan}
                          onChange={(e) => setNewConsultation({ ...newConsultation, treatment_plan: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createConsultation}>Save Consultation</Button>
                      <Button variant="outline" onClick={() => setShowNewConsultation(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 animate-spin mx-auto text-primary" />
                </div>
              ) : consultations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No consultations recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {consultations.map((consult) => (
                    <Card key={consult.id} className="border-border">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{consult.patients?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(consult.consultation_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge>{consult.chief_complaint}</Badge>
                          </div>
                          {consult.diagnosis && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Diagnosis:</p>
                              <p className="text-sm text-muted-foreground">{consult.diagnosis}</p>
                            </div>
                          )}
                          {consult.treatment_plan && (
                            <div>
                              <p className="text-sm font-medium text-foreground">Treatment:</p>
                              <p className="text-sm text-muted-foreground">{consult.treatment_plan}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drug-checker">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                AI Drug Interaction Checker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter medications separated by commas (e.g., Aspirin, Ibuprofen, Warfarin)"
                  value={drugCheck}
                  onChange={(e) => setDrugCheck(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={checkInteraction} disabled={checking}>
                  {checking ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Interactions"
                  )}
                </Button>
              </div>

              {interaction && (
                <div className="space-y-4">
                  <Card
                    className={`border-2 ${interaction.hasInteraction ? "border-amber-200 bg-amber-50" : "border-chart-2/20 bg-chart-2/5"}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle
                          className={`w-6 h-6 flex-shrink-0 mt-0.5 ${interaction.hasInteraction ? "text-amber-600" : "text-chart-2"}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-bold text-lg text-foreground">
                              {interaction.hasInteraction ? "Interactions Detected" : "No Significant Interactions"}
                            </p>
                            <Badge className={getSeverityColor(interaction.severity)}>
                              {interaction.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {interaction.interactions && interaction.interactions.length > 0 && (
                        <div className="space-y-4">
                          {interaction.interactions.map((inter: any, i: number) => (
                            <Card key={i} className="border-border">
                              <CardContent className="pt-4 space-y-3">
                                <div>
                                  <p className="font-semibold text-foreground mb-1">Interacting Drugs</p>
                                  <div className="flex flex-wrap gap-2">
                                    {inter.drugs.map((drug: string, j: number) => (
                                      <Badge key={j} variant="outline">
                                        {drug}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="font-semibold text-foreground mb-1">Type</p>
                                  <p className="text-sm text-muted-foreground">{inter.type}</p>
                                </div>

                                <div>
                                  <p className="font-semibold text-foreground mb-1">Mechanism</p>
                                  <p className="text-sm text-muted-foreground">{inter.mechanism}</p>
                                </div>

                                <div>
                                  <p className="font-semibold text-foreground mb-1">Clinical Effects</p>
                                  <p className="text-sm text-muted-foreground">{inter.clinicalEffects}</p>
                                </div>

                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                  <p className="font-semibold text-foreground mb-1">Management</p>
                                  <p className="text-sm text-muted-foreground">{inter.management}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {interaction.recommendations && interaction.recommendations.length > 0 && (
                        <div className="mt-4">
                          <p className="font-semibold text-foreground mb-2">Clinical Recommendations</p>
                          <ul className="space-y-2">
                            {interaction.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                                <span className="text-primary font-bold">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {interaction.alternatives && interaction.alternatives.length > 0 && (
                        <div className="mt-4">
                          <p className="font-semibold text-foreground mb-2">Alternative Medications</p>
                          <div className="flex flex-wrap gap-2">
                            {interaction.alternatives.map((alt: string, i: number) => (
                              <Badge key={i} variant="secondary">
                                {alt}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {interaction.monitoring && (
                        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="font-semibold text-blue-900 mb-1">Monitoring Requirements</p>
                          <p className="text-sm text-blue-800">{interaction.monitoring}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { DoctorAssistant }
export default DoctorAssistant
