import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

const diseaseDetectionSchema = z.object({
  diagnosis: z.string(),
  confidence: z.number(),
  severity: z.enum(["Mild", "Moderate", "Severe", "Critical"]),
  findings: z.array(
    z.object({
      finding: z.string(),
      location: z.string(),
      significance: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
  followUp: z.string(),
  differentialDiagnosis: z.array(z.string()),
})

export async function POST(req: Request) {
  try {
    const { image, imageType } = await req.json()

    if (!image) {
      return Response.json({ error: "Image is required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: diseaseDetectionSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert radiologist and medical imaging specialist. Analyze this medical image (${imageType || "X-ray/CT/MRI"}) and provide a detailed structured analysis.

Provide:
1. Primary diagnosis with confidence level (0-100)
2. Severity assessment
3. Specific findings with anatomical locations
4. Clinical recommendations
5. Follow-up care instructions
6. Differential diagnoses to consider

Be precise, use medical terminology, and provide actionable insights.`,
            },
            {
              type: "image",
              image,
            },
          ],
        },
      ],
    })

    return Response.json(object)
  } catch (error) {
    console.error("Disease detection error:", error)
    return Response.json({ error: "Failed to analyze medical image" }, { status: 500 })
  }
}
