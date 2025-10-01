import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"

const drugInteractionSchema = z.object({
  hasInteraction: z.boolean(),
  severity: z.enum(["none", "mild", "moderate", "severe", "contraindicated"]),
  interactions: z.array(
    z.object({
      drugs: z.array(z.string()),
      type: z.string(),
      mechanism: z.string(),
      clinicalEffects: z.string(),
      management: z.string(),
    }),
  ),
  recommendations: z.array(z.string()),
  alternatives: z.array(z.string()),
  monitoring: z.string(),
})

export async function POST(req: Request) {
  try {
    const { medications } = await req.json()

    if (!medications || medications.length < 2) {
      return Response.json({ error: "At least 2 medications required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: drugInteractionSchema,
      prompt: `You are a clinical pharmacologist expert. Analyze potential drug interactions between these medications:

Medications: ${medications.join(", ")}

Provide:
1. Whether interactions exist
2. Severity level of interactions
3. Detailed interaction information including:
   - Which drugs interact
   - Type of interaction
   - Mechanism of interaction
   - Clinical effects
   - Management strategies
4. Clinical recommendations
5. Alternative medication suggestions if needed
6. Monitoring requirements

Be thorough and evidence-based. Include all clinically significant interactions.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("Drug interaction check error:", error)
    return Response.json({ error: "Failed to check drug interactions" }, { status: 500 })
  }
}
