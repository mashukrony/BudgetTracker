"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  User,
  Users,
} from "lucide-react"
import appLogo from "@/components/images/AppLogo.png"
import { ClerkUserButton } from "@/components/layout/clerk-user-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/qa", label: "Q&A", icon: MessageSquareText },
  { href: "/admin/account", label: "Account", icon: User },
]

const gradientShell =
  "[&_[data-slot=sidebar-inner]]:rounded-none [&_[data-slot=sidebar-inner]]:shadow-lg [&_[data-sidebar=sidebar]]:border-0 [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-[#4c6fff] [&_[data-sidebar=sidebar]]:to-[#1e2a63] [&_[data-sidebar=sidebar]]:text-white"

const mobileSheetSurface =
  "border-0 bg-gradient-to-b from-[#4c6fff] to-[#1e2a63] text-white shadow-lg"

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  return (
    <SidebarProvider className={gradientShell}>
      <Sidebar collapsible="icon" variant="sidebar" sheetContentClassName={mobileSheetSurface}>
        <SidebarHeader className="gap-3 border-b border-white/15 p-4 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-1.5 group-data-[collapsible=icon]:py-2.5">
          <div className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-white/40 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:ring-1">
              <Image
                src={appLogo}
                alt="BudgetTracker"
                width={40}
                height={40}
                className="size-7 object-contain group-data-[collapsible=icon]:size-5"
                priority
              />
            </div>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold tracking-tight">Admin</span>
              <span className="text-xs text-white/80">BudgetTracker</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-1 pt-2">
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={isActive(href)}
                  tooltip={label}
                  className="text-white hover:bg-white/15 data-[active=true]:border-l-2 data-[active=true]:border-white data-[active=true]:bg-white/20"
                  render={<Link href={href} />}
                >
                  <Icon className="shrink-0" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/15 p-2 group-data-[collapsible=icon]:p-1.5">
          <SignOutButton redirectUrl="/sign-in">
            <Button
              variant="ghost"
              title="Log out"
              type="button"
              className="w-full justify-start gap-2 text-white hover:bg-white/15 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:min-w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
            >
              <LogOut className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Log out</span>
            </Button>
          </SignOutButton>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-[#f8f9fb]">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <SidebarTrigger />
            <span className="truncate text-sm font-medium text-muted-foreground md:hidden">
              BudgetTracker Admin
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ClerkUserButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
