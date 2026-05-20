"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  CreditCard,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LogOut,
  User,
  Wallet,
} from "lucide-react"
import appLogo from "@/components/images/AppLogo.png"
import { useBudgetApp } from "@/contexts/budget-app-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/categories", label: "Categories", icon: Layers },
  { href: "/spend-by-categories", label: "Spend by Categories", icon: BarChart3 },
  { href: "/help-support", label: "Help & Support", icon: HelpCircle },
  { href: "/account", label: "Account", icon: User },
]

const gradientShell =
  "[&_[data-slot=sidebar-inner]]:rounded-none [&_[data-slot=sidebar-inner]]:shadow-lg [&_[data-sidebar=sidebar]]:border-0 [&_[data-sidebar=sidebar]]:bg-gradient-to-b [&_[data-sidebar=sidebar]]:from-[#667eea] [&_[data-sidebar=sidebar]]:to-[#764ba2] [&_[data-sidebar=sidebar]]:text-white"

const mobileSheetSurface =
  "border-0 bg-gradient-to-b from-[#667eea] to-[#764ba2] text-white shadow-lg"

export function UserAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { userDisplayName, logout } = useBudgetApp()

  return (
    <SidebarProvider className={gradientShell}>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className="border-transparent"
        sheetContentClassName={mobileSheetSurface}
      >
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
              <span className="truncate font-semibold tracking-tight">BudgetTracker</span>
              <span className="text-xs text-white/80">Spend smarter</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-1 pt-2">
            {NAV.map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={pathname === href}
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
          <Button
            variant="ghost"
            title="Log out"
            className="w-full justify-start gap-2 text-white hover:bg-white/15 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:min-w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
            onClick={logout}
          >
            <LogOut className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Log out</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-[#f8f9fb]">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <SidebarTrigger />
            <span className="truncate text-sm font-medium text-muted-foreground md:hidden">
              BudgetTracker
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">Signed in</span>
            <Avatar className="size-9 ring-2 ring-[#667eea]/25">
              <AvatarFallback className="bg-[#667eea]/15 text-sm font-semibold text-[#5b21b6]">
                {userDisplayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <User className="hidden size-[18px] text-muted-foreground sm:block" aria-hidden />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
