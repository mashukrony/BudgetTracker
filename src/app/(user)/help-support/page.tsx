"use client"

import * as React from "react"
import { BookOpen, Mail, Phone, Send } from "lucide-react"
import { BudgetBuddyChat } from "@/components/help/budget-buddy-chat"
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
import { Textarea } from "@/components/ui/textarea"

const FAQ = [
  {
    q: "How does BudgetTracker notify me?",
    a: "In-app alerts are stored in PostgreSQL when category spend reaches or exceeds your allocated budget.",
  },
  {
    q: "Can admins see my messages?",
    a: "Support tickets submitted here appear in the Admin Q&A console for follow-up.",
  },
  {
    q: "Is my data synced to the cloud?",
    a: "Yes — budgets, categories, transactions, and tickets are persisted in your Neon PostgreSQL database.",
  },
]

export default function HelpSupportPage() {
  const { userDisplayName, userEmail, addSupportMessage } = useBudgetApp()
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const submitTicket = async () => {
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    try {
      await addSupportMessage({
        subject: subject.trim(),
        message: message.trim(),
      })
      setSubject("")
      setMessage("")
      setSent(true)
      window.setTimeout(() => setSent(false), 4000)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not submit ticket.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Help & support</h1>
        <p className="mt-1 text-muted-foreground">
          Reach the team, skim tutorials, or chat with BudgetBuddy — tickets are saved to your account
          ({userEmail}) as {userDisplayName}.
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
          body={<span>Self-serve playbook and walkthrough clips.</span>}
        />
      </div>

      <BudgetBuddyChat />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Send a ticket</CardTitle>
          <CardDescription>Administrators monitor these messages from the Admin Q&A page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="h-subject">Subject</Label>
            <Input id="h-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="h-msg">Message</Label>
            <Textarea id="h-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button
            className="w-fit bg-[#667eea] hover:bg-[#5b21b6]"
            type="button"
            disabled={submitting}
            onClick={() => void submitTicket()}
          >
            <Send className="size-4" />
            {submitting ? "Submitting…" : "Submit"}
          </Button>
          {sent ? (
            <p className="text-sm text-emerald-600">Ticket saved — our team will follow up by email.</p>
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
