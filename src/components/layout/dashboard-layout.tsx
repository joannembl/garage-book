'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Car,
  Wrench,
  Sliders,
  Receipt,
  User,
  LogOut,
  Menu,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Garage', href: '/', icon: Car },
  { name: 'Maintenance Log', href: '/maintenance', icon: Wrench },
  { name: 'Modifications', href: '/modifications', icon: Sliders },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Profile', href: '/profile', icon: User },
]

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_pro: boolean
}

export function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: UserProfile | null
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Find the current page name for the header title
  const currentNavItem = navigation.find((item) => item.href === pathname)
  const pageTitle = currentNavItem ? currentNavItem.name : 'GarageBook'

  const handleSignOut = async () => {
    await signOut()
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return 'GB'
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'GB'
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
            {isActive && <ChevronRight className="ml-auto h-4 w-4 shrink-0" />}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Car className="h-5 w-5" />
            </span>
            <span>
              Garage<span className="text-primary font-black">Book</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Pro Banner Sidebar - only show if not already Pro */}
        <div className="p-4 border-t">
          {user?.is_pro ? (
            <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-card p-4 shadow-sm border-primary/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                <Sparkles className="h-3.5 w-3.5 fill-primary" />
                <span>PRO SUBSCRIBER 🌟</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Thank you for supporting GarageBook. You have unlimited access.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-gradient-to-br from-card to-secondary/40 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1.5">
                <Sparkles className="h-3.5 w-3.5 fill-primary" />
                <span>GARAGEBOOK PRO</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-normal">
                Unlock unlimited vehicles, AI uploads, and advanced reports.
              </p>
              <Link href="/profile">
                <Button size="sm" className="w-full text-xs font-semibold" variant="outline">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* User logout section */}
        <div className="border-t p-4 flex items-center justify-between gap-3 bg-secondary/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-sm border border-primary/20">
              {getInitials()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate leading-none mb-1">
                {user?.full_name || 'Enthusiast User'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate leading-none">
                {user?.email || 'user@garagebook.app'}
              </span>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              } />
              <SheetContent side="left" className="w-72 p-0 flex flex-col h-full bg-card">
                <div className="flex h-16 items-center justify-between border-b px-6 shrink-0">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 font-bold text-xl tracking-tight"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Car className="h-5 w-5" />
                    </span>
                    <span>
                      Garage<span className="text-primary font-black">Book</span>
                    </span>
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <NavLinks onClick={() => setIsOpen(false)} />
                </div>
                {/* Pro Banner Mobile */}
                <div className="p-4 border-t shrink-0">
                  {user?.is_pro ? (
                    <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-card p-4 shadow-sm border-primary/20">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                        <Sparkles className="h-3.5 w-3.5 fill-primary" />
                        <span>PRO SUBSCRIBER 🌟</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        Thank you for supporting GarageBook. You have unlimited access.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border bg-gradient-to-br from-card to-secondary/40 p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 fill-primary" />
                        <span>GARAGEBOOK PRO</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-normal">
                        Unlock unlimited vehicles, AI uploads, and advanced reports.
                      </p>
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button size="sm" className="w-full text-xs font-semibold" variant="outline">
                          Upgrade Now
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                {/* User Mobile Footer */}
                <div className="border-t p-4 flex items-center justify-between gap-3 bg-secondary/10 shrink-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 text-sm border border-primary/20">
                      {getInitials()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate leading-none mb-1">
                        {user?.full_name || 'Enthusiast User'}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate leading-none">
                        {user?.email || 'user@garagebook.app'}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-bold md:text-xl tracking-tight">{pageTitle}</h1>
          </div>
        </header>

        {/* Page children wrapped inside dashboard layout view shell */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
