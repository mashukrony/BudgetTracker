"use client"

import * as React from "react"
import { BookOpen, Mail, MessageSquare, Phone, Send } from "lucide-react"
import { useBudgetApp } from "@/contexts/budget-app-context"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const FAQ = [
  {
    q: "How does BudgetTracker notify me?",
    a: "In-app alerts cover category thresholds, envelopes that exceed allocations, pacing insights, and monthly savings summaries.",
  },
  {
    q: "Can admins see my messages?",
    a: "Support tickets submitted here populate the Admin Q&A console for follow-up.",
  },
  {
    q: "Is my demo data synced to the cloud?",
    a: "This build stores everything locally in-browser state until you attach a backend or database.",
  },
]

export default function HelpSupportPage() {
  const { userDisplayName, userEmail, addSupportMessage } = useBudgetApp()
  const [name, setName] = React.useState(userDisplayName)
  const [email, setEmail] = React.useState(userEmail)
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [sent, setSent] = React.useState(false)

  React.useEffect(() => {
    setName(userDisplayName)
    setEmail(userEmail)
  }, [userDisplayName, userEmail])

  const submitTicket = () => {
    if (!subject.trim() || !message.trim()) return
    addSupportMessage({
      username: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    })
    setSubject("")
    setMessage("")
    setSent(true)
    window.setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:flex-row md:px-8">
      <div className="flex-1 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Help & support</h1>
          <p className="mt-1 text-muted-foreground">
            Reach humans, skim tutorials, or use the onboard assistant — every message also logs to admin Q&A for this demo.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <ContactCard
            icon={Mail}
            title="Email"
            body={<a href="mailto:support@budgettracker.example">support@budgettracker.example</a>}
          />
          <ContactCard icon={Phone} title="Phone" body={<span className="tabular-nums">+60 3-1234-5678</span>} />
          <ContactCard
            icon={BookOpen}
            title="Tutorials"
            body={<span>Self-serve playbook & walkthrough clips (placeholder).</span>}
          />
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Send a ticket</CardTitle>
            <CardDescription>Administrators monitor these messages from the Admin Q&A page.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="h-name">Name</Label>
                <Input id="h-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="h-email">Email</Label>
                <Input
                  id="h-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="h-subject">Subject</Label>
              <Input id="h-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h-msg">Message</Label>
              <Textarea id="h-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button className="w-fit bg-[#667eea] hover:bg-[#5b21b6]" type="button" onClick={submitTicket}>
              <Send className="size-4" />
              Submit
            </Button>
            {sent ? (
              <p className="text-sm text-emerald-600">
                Received — admins can reply manually once your backend connects.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold">FAQs</h2>
          <Accordion className="divide-y rounded-lg border border-border/80 bg-card">
            {FAQ.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-0 px-4">
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <div className="md:w-[320px]">
        <ChatbotPanel />
      </div>
    </div>
  )
}

function ContactCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Mail
  title: string
  body: React.ReactNode
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Icon className="size-4 text-[#667eea]" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground [&_a]:text-[#667eea] [&_a]:underline">{body}</CardContent>
    </Card>
  )
}

function ChatbotPanel() {
  const [open, setOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [msgs, setMsgs] = React.useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Ask about budgeting rules, envelopes, or this demo workspace." },
  ])

  const respond = React.useCallback((q: string) => {
    const lower = q.toLowerCase()
    if (lower.includes("budget"))
      return "Start with a realistic monthly envelope on the Budget tab, then map categories to discretionary spend."
    if (lower.includes("alert") || lower.includes("notification"))
      return "Notifications fire from category pacing, savings highlights, or hard budget breaches recorded in Transactions."
    if (lower.includes("admin"))
      return "Admins reply through the Q&A screen using your logged email/username."
    return "I am a deterministic helper for this scaffold — plug in your LLM or CRM when you integrate."
  }, [])

  const send = () => {
    if (!input.trim()) return
    const userText = input.trim()
    setMsgs((prev) => [...prev, { role: "user", text: userText }])
    setInput("")
    window.setTimeout(() => {
      setMsgs((prev) => [...prev, { role: "bot", text: respond(userText) }])
    }, 250)
  }

  return (
    <Card className="sticky top-24 border-border/80 shadow-md">
      <CardHeader className="flex flex-row items-center gap-2">
        <MessageSquare className="size-4" />
        <div>
          <CardTitle className="text-base">Assistant</CardTitle>
          <CardDescription>Guided shortcuts for FAQs</CardDescription>
        </div>
        <Button size="xs" variant="outline" className="ml-auto" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"}
        </Button>
      </CardHeader>
      {open ? (
        <CardContent className="flex flex-col gap-2">
          <ScrollArea className="h-[220px] rounded-md border p-3 text-sm">
            <div className="flex flex-col gap-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 ${
                    m.role === "user" ? "ml-4 bg-muted" : "mr-4 bg-[#eef2ff]"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="flex gap-2">
            <Input
              placeholder="Try “How do alerts work?”"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button size="sm" variant="secondary" onClick={send}>
              Send
            </Button>
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
