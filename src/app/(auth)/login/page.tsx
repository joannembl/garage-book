'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { Car, Lock, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleDemoLogin = (email: string) => {
    setError(null)
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', 'demo-password-123')

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Car className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Garage<span className="text-primary font-black">Book</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            The ultimate digital logbook for car enthusiasts and build projects.
          </p>
        </div>

        <Card className="border shadow-lg bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your garage dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold shadow-md" disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Trigger Option */}
            <Button
              variant="outline"
              className="w-full text-xs font-semibold shadow-sm"
              disabled={isPending}
              onClick={() => handleDemoLogin('enthusiast@garagebook.app')}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.18 1-.78 1.85-1.63 2.42v2.77h2.64c1.55-1.42 2.44-3.52 2.44-6.01z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-2.64-2.77c-.74.5-1.69.8-2.64.8-2.66 0-4.91-1.8-5.71-4.22H1.93v2.92C3.75 20.19 7.6 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M6.29 14.15A7.12 7.12 0 0 1 5.92 12c0-.74.13-1.47.37-2.15V6.93H1.93a12.02 12.02 0 0 0 0 10.14l4.36-2.92z"
                />
                <path
                  fill="currentColor"
                  d="M12 4.75c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.49 14.96 1 12 1 7.6 1 3.75 3.81 1.93 7.6l4.36 2.92c.8-2.42 3.05-4.22 5.71-4.22z"
                />
              </svg>
              Google Account
            </Button>
          </CardContent>

          {/* Quick Demo Accounts Block (Amazing Sandbox UX) */}
          <div className="bg-secondary/20 p-4 border-t border-b">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
              ⚡ Sandbox Demo Accounts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-[10px] font-semibold h-7"
                onClick={() => handleDemoLogin('builder@garagebook.app')}
                disabled={isPending}
              >
                Project Builder (Free)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-[10px] font-semibold h-7"
                onClick={() => handleDemoLogin('collector@pro.app')}
                disabled={isPending}
              >
                Meticulous Owner (Pro)
              </Button>
            </div>
          </div>

          <CardFooter className="flex justify-center pt-4">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
