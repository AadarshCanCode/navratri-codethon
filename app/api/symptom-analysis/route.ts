import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

const diagnosisSchema = z.object({
  conditions: z.array(
    z.object({
      condition: z.string(),
      probability: z.number(),
      severity: z.enum(["low", "medium", "high"]),
      description: z.string(),
      recommendations: z.array(z.string()),
    }),
  ),
  urgencyLevel: z.enum(["routine", "soon", "urgent", "emergency"]),
  generalAdvice: z.string(),
})

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json()

    if (!symptoms) {
      return Response.json({ error: "Symptoms are required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: diagnosisSchema,
      prompt: `You are an expert medical AI assistant. Analyze the following symptoms and provide a structured diagnosis.

Symptoms: ${symptoms}

Provide:
1. Top 5 possible conditions with probability percentages (0-100)
2. Severity level for each (low/medium/high)
3. Brief description of each condition
4. Specific recommendations for each condition
5. Overall urgency level (routine/soon/urgent/emergency)
6. General medical advice

Be accurate, evidence-based, and include appropriate medical disclaimers in recommendations.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("Symptom analysis error:", error)
    return Response.json({ error: "Failed to analyze symptoms" }, { status: 500 })
  }
}
