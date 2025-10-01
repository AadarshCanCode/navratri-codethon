import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { age, weight, height, smoking, exercise, diet } = body

    // Calculate BMI
    const heightInMeters = Number.parseInt(height) / 100
    const bmi = Number.parseInt(weight) / (heightInMeters * heightInMeters)

    const prompt = `You are a medical AI assistant. Based on the following patient data, provide a detailed health risk assessment:

Patient Data:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- BMI: ${bmi.toFixed(1)}
- Smoking Status: ${smoking}
- Exercise Frequency: ${exercise}
- Diet Quality: ${diet}

Please provide:
1. Diabetes risk percentage (0-100)
2. Heart attack risk percentage (0-100)
3. Stroke risk percentage (0-100)
4. Detailed explanation for each risk factor
5. Personalized recommendations (at least 5 specific recommendations)

Format your response as JSON with this structure:
{
  "diabetes": number,
  "heartAttack": number,
  "stroke": number,
  "explanations": {
    "diabetes": "string",
    "heartAttack": "string",
    "stroke": "string"
  },
  "recommendations": ["string", "string", ...]
}`

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp", {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      prompt,
    })

    // Parse the JSON response from Gemini
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const results = JSON.parse(jsonMatch[0])

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Health risk prediction error:", error)
    return NextResponse.json({ error: "Failed to calculate health risks" }, { status: 500 })
  }
}
