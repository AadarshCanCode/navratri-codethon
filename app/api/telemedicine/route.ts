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
      system: `You are an empathetic and knowledgeable telemedicine doctor. You are conducting a virtual consultation.

Guidelines:
- Be professional, caring, and thorough
- Ask relevant follow-up questions
- Provide clear medical advice
- Remember the conversation context
- Suggest when in-person care is needed
- Use simple language while being medically accurate
- Always include appropriate disclaimers

Remember all previous messages in this consultation.`,
      messages: history,
    })

    // Save assistant response to history (will be done after streaming)
    const stream = result.toDataStreamResponse()

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
