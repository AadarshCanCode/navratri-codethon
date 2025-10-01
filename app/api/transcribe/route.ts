import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"
import { Buffer } from "buffer"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert audio file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Note: Gemini doesn't directly support audio transcription yet
    // This is a placeholder that simulates the workflow
    // In production, you'd use Google Speech-to-Text API first, then process with Gemini

    const prompt = `You are a medical AI assistant. Based on this doctor-patient conversation transcript, create structured clinical notes.

[Simulated transcript - In production, this would come from Speech-to-Text API]
Doctor: "Hello, what brings you in today?"
Patient: "I've been having persistent headaches for about 2 weeks now."
Doctor: "Can you describe the headaches? Where do you feel them?"
Patient: "Mostly in the front of my head, and sometimes I feel a bit nauseous. Bright lights bother me too."
Doctor: "Any other symptoms? Fatigue?"
Patient: "Yes, I've been feeling quite tired lately."
Doctor: "Based on your symptoms, this appears to be tension-type headaches, likely stress-related. I'll prescribe some medication and we'll monitor your progress."

Extract and structure:
1. Patient name (use placeholder if not mentioned)
2. Visit date (today's date)
3. Chief complaint
4. List of symptoms
5. Diagnosis
6. Medications prescribed with dosage instructions
7. Follow-up plan

Format as JSON:
{
  "patientName": "string",
  "date": "string",
  "chiefComplaint": "string",
  "symptoms": ["string", ...],
  "diagnosis": "string",
  "medications": ["string with dosage", ...],
  "followUp": "string"
}`

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp", {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      prompt,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const transcription = JSON.parse(jsonMatch[0])

    return NextResponse.json(transcription)
  } catch (error) {
    console.error("[v0] Transcription error:", error)
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
