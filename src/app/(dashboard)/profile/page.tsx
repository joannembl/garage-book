'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { Sparkles, User, Mail, Shield, Check, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProfile, getCurrentUser, toggleProStatus } from '@/app/actions/auth'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_pro: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const [isProPending, startProTransition] = useTransition()

  // Fetch current user details on client mount
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (e) {
        console.error('Failed to load user:', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const formData = new FormData(e.currentTarget)
    formData.append('isPro', user?.is_pro ? 'true' : 'false')

    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess('Profile updated successfully!')
        // Reload user details
        const updatedUser = await getCurrentUser()
        setUser(updatedUser)
        
        // Refresh sidebar by firing a dummy reload event or just letting state render
        if (typeof window !== 'undefined') {
          // Trigger a custom event to notify other layout parts if needed
          window.dispatchEvent(new Event('profile-updated'))
        }
      }
    })
  }

  const handleTogglePro = () => {
    setError(null)
    setSuccess(null)
    
    startProTransition(async () => {
      const result = await toggleProStatus()
      if (result?.error) {
        setError(result.error)
      } else {
        // Toggle was successful, update local state
        const updatedUser = await getCurrentUser()
        setUser(updatedUser)
        setSuccess(updatedUser?.is_pro ? 'Welcome to GarageBook Pro! 🌟' : 'Subscription changed to Free tier.')
        
        // Refresh layout
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profile-updated'))
        }
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Your Profile</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account settings, enthusiast profile, and subscription tier.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Settings Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Update your public enthusiast name and email details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 border border-emerald-500/20 font-medium">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="pl-10 bg-muted cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Email address cannot be changed (managed by Supabase Auth).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name / Nickname
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="fullName"
                        defaultValue={user?.full_name || ''}
                        placeholder="Alex Enthusiast"
                        className="pl-10"
                        required
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="font-semibold shadow-sm text-xs" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Subscription / Membership Status Column */}
        <div className="space-y-6">
          <Card className="shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Account Status</span>
              </CardTitle>
              <CardDescription>
                Your active GarageBook tier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Badge Display */}
              {user?.is_pro ? (
                <div className="rounded-xl border bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-card p-5 border-yellow-500/20 text-center shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600 mb-3">
                    <Sparkles className="h-5 w-5 fill-yellow-500/20" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-yellow-600">GARAGEBOOK PRO 🌟</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    You have unlocked unlimited builds, AI uploads, and advanced tools. Thank you for your support!
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border bg-gradient-to-br from-card to-secondary/30 p-5 text-center shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3 border">
                    <User className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">FREE TIER 🏎️</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Limited to 1 vehicle build, basic logging, and 10MB photo storage. Upgrade to unlock the full package!
                  </p>
                </div>
              )}

              {/* Benefits Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pro Membership Perks:
                </h4>
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span className="text-muted-foreground leading-normal">
                      <strong>Unlimited Vehicles:</strong> Log your entire project fleet.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span className="text-muted-foreground leading-normal">
                      <strong>AI Excel/CSV Imports:</strong> Instantly import spreadsheet logs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span className="text-muted-foreground leading-normal">
                      <strong>Advanced PDF Reports:</strong> Professional PDF exports of your ownership logbook.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span className="text-muted-foreground leading-normal">
                      <strong>Unlimited Photo Storage:</strong> High-res receipts, builds, and parts.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Upgrade / Downgrade Action Button */}
              <Button
                onClick={handleTogglePro}
                className={`w-full font-bold shadow-md transition-all duration-300 text-xs ${
                  user?.is_pro
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0'
                }`}
                disabled={isProPending}
              >
                {isProPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                ) : user?.is_pro ? (
                  'Cancel Premium Subscription'
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5 fill-white/10" />
                    <span>Upgrade to Pro ($39/yr)</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
