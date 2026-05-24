"use client"

import * as React from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Bot, Loader2, Send, Sparkles, Square, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  { label: "Give me a tip to save money", prompt: "Give me a practical tip to save money this month." },
  { label: "Explain the 50/30/20 rule", prompt: "Explain the 50/30/20 budgeting rule with a simple example." },
  {
    label: "How do I use BudgetTracker?",
    prompt: "How do I use the Budget, Transactions, and Spend by Categories pages in BudgetTracker?",
  },
  {
    label: "Reduce food spending",
    prompt: "What are clever ways to reduce food and dining spending without feeling deprived?",
  },
] as const

const WELCOME: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Hi! I'm **BudgetBuddy**, your finance co-pilot. Ask for saving tips, budgeting frameworks, or how to get more from BudgetTracker.",
    },
  ],
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

export function BudgetBuddyChat() {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [input, setInput] = React.useState("")

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: [WELCOME],
  })

  const isBusy = status === "submitted" || status === "streaming"

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  const submitText = React.useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isBusy) return
      setInput("")
      void sendMessage({ text: trimmed })
    },
    [isBusy, sendMessage]
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitText(input)
  }

  const displayMessages = messages.length > 0 ? messages : [WELCOME]

  return (
    <Card className="overflow-hidden border-border/80 bg-gradient-to-br from-white via-[#faf8ff] to-[#eef2ff] shadow-lg dark:from-card dark:via-card dark:to-card">
      <CardHeader className="border-b border-border/60 bg-white/60 pb-4 backdrop-blur dark:bg-card/80">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-md">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">BudgetBuddy AI</CardTitle>
            <CardDescription>
              Streaming answers powered by Gemini — budgets, saving tips, and app guidance.
            </CardDescription>
          </div>
          {isBusy ? (
            <Button type="button" size="sm" variant="outline" onClick={() => stop()} className="shrink-0">
              <Square className="size-3.5" />
              Stop
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-0">
        <div
          ref={scrollRef}
          className="flex max-h-[min(52vh,520px)] min-h-[320px] flex-col gap-4 overflow-y-auto px-4 py-5 md:px-6"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {displayMessages.map((message) => {
            const isUser = message.role === "user"
            const text = getMessageText(message)
            if (!text && message.role === "assistant" && isBusy) return null

            return (
              <div
                key={message.id}
                className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    isUser
                      ? "bg-[#667eea] text-white"
                      : "border border-[#667eea]/20 bg-[#eef2ff] text-[#667eea]"
                  )}
                  aria-hidden
                >
                  {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div
                  className={cn(
                    "max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    isUser
                      ? "rounded-tr-md bg-gradient-to-br from-[#667eea] to-[#5b21b6] text-white"
                      : "rounded-tl-md border border-border/70 bg-white text-foreground dark:bg-muted/40"
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                  ) : (
                    <div className="markdown-chat">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-[#4338ca] dark:text-[#a5b4fc]">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
                          ),
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h1: ({ children }) => (
                            <h3 className="mb-2 text-base font-semibold">{children}</h3>
                          ),
                          h2: ({ children }) => (
                            <h3 className="mb-2 text-base font-semibold">{children}</h3>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-1.5 text-sm font-semibold">{children}</h3>
                          ),
                        }}
                      >
                        {text || "…"}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {status === "submitted" ? (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#667eea]/20 bg-[#eef2ff] text-[#667eea]">
                <Bot className="size-4" aria-hidden />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-border/70 bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="size-4 animate-spin text-[#667eea]" />
                BudgetBuddy is thinking…
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 border-t border-border/60 bg-white/70 px-4 py-4 backdrop-blur dark:bg-card/80 md:px-6">
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={isBusy}
                onClick={() => submitText(chip.prompt)}
                className="rounded-full border border-[#667eea]/25 bg-[#eef2ff]/80 px-3 py-1.5 text-xs font-medium text-[#4338ca] transition hover:border-[#667eea]/50 hover:bg-[#e0e7ff] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#c7d2fe]"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BudgetBuddy anything about budgeting…"
              disabled={isBusy}
              className="min-h-10 flex-1 border-border/80 bg-white dark:bg-background"
              aria-label="Message BudgetBuddy"
            />
            <Button
              type="submit"
              disabled={isBusy || !input.trim()}
              className="shrink-0 bg-[#667eea] hover:bg-[#5b21b6]"
            >
              {isBusy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
