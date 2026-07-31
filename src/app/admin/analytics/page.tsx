import React from 'react'
import { getAnalyticsSummary } from '@/app/actions/analytics'
import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Users, Target, MousePointer2, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = ['admin@garagebook.app', 'enthusiast@garagebook.app'] // enthusiast@garagebook.app is the mock user

export default async function AnalyticsPage() {
  const user = await getCurrentUser()
  
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    redirect('/dashboard')
  }

  const summary = await getAnalyticsSummary()

  if ('error' in summary) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
          <h1 className="text-2xl font-bold">Analytics Error</h1>
          <p className="text-zinc-400">{summary.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Growth Dashboard</h1>
            <p className="text-zinc-500 font-medium">Monitoring outreach and acquisition performance.</p>
          </div>
          {summary.isMock && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500">
              <AlertCircle className="h-3 w-3" />
              <span>RUNNING IN MOCK MODE</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Signups" 
            value={summary.totalSignups} 
            description="Last 7 days"
            icon={<Users className="h-5 w-5 text-red-600" />}
          />
          <StatCard 
            title="All-Time Signups" 
            value={summary.allTimeSignups || 0} 
            description="Since launch"
            icon={<TrendingUp className="h-5 w-5 text-red-600" />}
          />
          <StatCard 
            title="Top Campaign" 
            value={summary.campaignBreakdown?.[0]?.name || 'N/A'} 
            description={summary.campaignBreakdown?.[0]?.count ? `${summary.campaignBreakdown[0].count} conversions` : 'No data'}
            icon={<Target className="h-5 w-5 text-red-600" />}
          />
          <StatCard 
            title="Campaign Count" 
            value={summary.campaignBreakdown?.length || 0} 
            description="Active UTM campaigns"
            icon={<MousePointer2 className="h-5 w-5 text-red-600" />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trend Chart (CSS bar representation) */}
          <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Signup Trend</CardTitle>
              <CardDescription>Daily conversions for the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 pt-4">
                {(summary.signupTrend as {date: string, count: number}[])?.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative">
                       <div 
                         className="w-full bg-red-600/20 group-hover:bg-red-600/40 transition-colors rounded-t-sm relative flex items-end justify-center"
                         style={{ height: `${(day.count / Math.max(...(summary.signupTrend as {date: string, count: number}[]).map((d) => d.count || 1), 1)) * 200}px`, minHeight: day.count > 0 ? '4px' : '0' }}
                       >
                         {day.count > 0 && <span className="text-[10px] font-bold mb-1">{day.count}</span>}
                       </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter transform -rotate-45 md:rotate-0 mt-2">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Breakdown */}
          <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>UTM Campaigns</CardTitle>
              <CardDescription>Conversion source attribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(summary.campaignBreakdown as {name: string, count: number}[])?.length > 0 ? (
                  (summary.campaignBreakdown as {name: string, count: number}[]).map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-400 truncate max-w-[150px]">{c.name}</span>
                      <div className="flex items-center gap-3">
                         <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600" 
                              style={{ width: `${(c.count / ((summary.allTimeSignups as number) || 1)) * 100}%` }} 
                            />
                         </div>
                         <span className="text-sm font-black">{c.count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-zinc-600 text-sm italic">No campaign data recorded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] pt-8">
          GarageBook Internal Analytics • Confidential
        </p>
      </div>
    </div>
  )
}

function StatCard({ title, value, description, icon }: { title: string, value: string | number, description: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-white">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="text-white">
        <div className="text-2xl font-black">{value}</div>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
