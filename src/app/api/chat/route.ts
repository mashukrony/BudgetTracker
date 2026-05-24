import { auth } from "@clerk/nextjs/server"
import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: await convertToModelMessages(messages),
    system: `You are "BudgetBuddy", an advanced personal finance AI assistant integrated directly into the BudgetTracker system. 
    Your job is to provide highly actionable, clever tips and tricks regarding personal budgeting, saving money, and keeping track of expenses.
    
    Guidelines:
    - Keep responses professional yet friendly and concise. Use bullet points for readability.
    - If the user asks about the specific system features, remind them they can set budgets in the "Budget Page", log expenses in the "Transactions Page", and view insights on the "Spend By Categories" view.
    - Never give concrete professional legal/investment advice (e.g., picking specific stocks), stick to general financial health and budgeting best practices (like the 50/30/20 rule).`,
  })

  return result.toUIMessageStreamResponse()
}
