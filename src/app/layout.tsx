import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { AuthSignOutRedirect } from "@/components/layout/auth-sign-out-redirect"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "BudgetTracker — Budgets, alerts & spending",
  description:
    "Track monthly budgets, categories, transactions, and overspend alerts across web and mobile-friendly views.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
      >
        <ClerkProvider
          signInFallbackRedirectUrl="/auth/post-sign-in"
          signUpFallbackRedirectUrl="/auth/post-sign-in"
          signInForceRedirectUrl="/auth/post-sign-in"
          signUpForceRedirectUrl="/auth/post-sign-in"
          afterSignOutUrl="/sign-in"
          afterMultiSessionSingleSignOutUrl="/sign-in"
        >
          <AuthSignOutRedirect />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Providers>{children}</Providers>
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}
