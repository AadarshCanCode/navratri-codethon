import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 for processing
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type

    const prompt = `You are a medical AI assistant. Analyze this medical report image and provide a comprehensive summary.

Extract and provide:
1. Patient name (if visible)
2. Report date
3. Key findings (list all important test results and measurements)
4. Primary diagnosis or assessment
5. Medications mentioned (if any)
6. Recommendations or follow-up instructions

Format your response as JSON with this structure:
{
  "patientName": "string or 'Not specified'",
  "date": "string",
  "keyFindings": ["string", "string", ...],
  "diagnosis": "string",
  "medications": ["string", ...],
  "recommendations": ["string", "string", ...]
}

Provide clear, patient-friendly language. If information is not available in the report, indicate "Not specified".`

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp", {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              image: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const summary = JSON.parse(jsonMatch[0])

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[v0] Report summarization error:", error)
    return NextResponse.json({ error: "Failed to summarize report" }, { status: 500 })
  }
}
