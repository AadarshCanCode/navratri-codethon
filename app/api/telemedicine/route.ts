import { google } from "@ai-sdk/google"
import { streamText } from "ai"

// In-memory conversation storage (in production, use a database)
const conversations = new Map<string, Array<{ role: string; content: string }>>()

export async function POST(req: Request) {
  try {
  const { message, sessionId, patientContext } = await req.json()

    if (!message || !sessionId) {
      return Response.json({ error: "Message and sessionId are required" }, { status: 400 })
    }

    // Get or create conversation history
    const history = conversations.get(sessionId) || []

    // Add patient context to first message if provided
    if (history.length === 0 && patientContext) {
      history.push({
        role: "system",
        content: `Patient Context: ${JSON.stringify(patientContext)}`,
      })
    }

    // Add user message to history
    history.push({ role: "user", content: message })

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      // Stronger, safety-focused system prompt with empathy and escalation rules
      system: `You are an empathetic, patient-centered telemedicine clinician and medical assistant. Your role is to:

- Respond with clear, compassionate, and non-judgmental language.
- Prioritize patient safety: if a user reports red-flag symptoms (e.g., difficulty breathing, chest pain, sudden weakness, uncontrolled bleeding, loss of consciousness), instruct them to seek emergency care immediately and provide local emergency guidance if available.
- Ask concise, relevant follow-up questions to clarify symptoms, duration, severity, and risk factors.
- Provide general medical information, evidence-based first-aid steps, and reasonable next steps (self-care, when to see a clinician, possible specialist referral). Do NOT provide a definitive diagnosis when information is limited; instead, explain likely possibilities and recommend evaluation when appropriate.
- Use plain language, avoid unnecessary jargon, and include empathetic phrases (e.g., "I'm sorry you're experiencing this", "That sounds distressing", "I know this can be worrying").
- Include a clear disclaimer in every session: this is not a substitute for in-person evaluation; encourage follow-up with a qualified healthcare professional when needed.
- If asked for medication dosing or prescriptions, give typical dosing ranges where safe and appropriate, but always recommend confirming with a licensed prescriber and include safety checks (allergies, pregnancy, age, comorbidities).
- Never provide instructions that would be unsafe without examination (e.g., perform invasive procedures). When uncertain, advise the user to seek in-person care.
- Preserve conversation history and use it to make appropriate recommendations.

When responding, be concise but thorough, and close with a clear suggested next step (e.g., "If symptoms worsen, call emergency services; otherwise consider scheduling a telemedicine visit").`,
      // cast to any to accommodate differing SDK message typings in this project
      messages: history as any,
    })

    // Save assistant response to history (will be done after streaming)

  // The SDK exposes a text stream response helper; use it to return a streaming Response
  const stream = (result as any).toTextStreamResponse()

    // Store the updated history
    result.text.then((text) => {
      history.push({ role: "assistant", content: text })
      conversations.set(sessionId, history)
    })

    return stream
  } catch (error) {
    console.error("Telemedicine chat error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
