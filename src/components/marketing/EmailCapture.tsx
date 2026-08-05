'use client'

import React, { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeToNewsletter } from '@/app/actions/marketing'
import { Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

export function EmailCapture() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      
      const result = await subscribeToNewsletter(formData)
      
      if (result.success) {
        setIsSubmitted(true)
        setEmail('')
      } else {
        setError(result.error || 'Something went wrong. Please try again.')
      }
    })
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
        <p className="text-zinc-400 max-w-sm">
          Thanks! We&apos;ll keep you posted on early access and new features.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-zinc-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-zinc-900 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-[10px] font-black tracking-widest uppercase text-red-500 mb-4">
              <Sparkles className="h-3 w-3" />
              <span>Join the Community</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
              Get Early Access
            </h2>
            <p className="text-zinc-400 text-lg max-w-md">
              Be the first to know when we launch new features and professional reporting tools.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-14 bg-zinc-950 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:ring-red-600 focus:border-red-600 transition-all pl-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
              />
              {error && (
                <p className="absolute -bottom-6 left-0 text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
                  {error}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all shrink-0"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Stay Updated
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <p className="mt-8 text-center text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
            No spam. No nonsense. Just car stuff.
          </p>
        </div>
      </div>
    </div>
  )
}
