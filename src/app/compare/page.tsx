import React from 'react'
import Link from 'next/link'
import { 
  Car, 
  Check, 
  X, 
  Minus, 
  FileText, 
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Spreadsheets vs GarageBook | Why Your Car Deserves Better',
  description: 'Compare spreadsheets to GarageBook. See why digital logging beats manual tracking for maintenance, modifications, and resale value.',
}

export default function ComparePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-red-600/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Car className="h-5 w-5" />
            </span>
            <span>
              Garage<span className="text-red-600 font-black">Book</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold hover:bg-white/5">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 shadow-[0_0_15px_rgba(220,38,38,0.3)] border-none">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16 space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
              Why Your Car Deserves Better <br />
              <span className="text-red-600 italic">Than a Spreadsheet</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Spreadsheets are where car histories go to die. GarageBook is where they become professional records that protect your investment.
            </p>
          </section>

          {/* The Spreadsheet Problem */}
          <section className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 md:p-12 mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-3xl pointer-events-none" />
            <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="h-1.5 w-8 bg-red-600 rounded-full" />
              The Spreadsheet Problem
            </h2>
            <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
              <p>
                You know the spreadsheet. It started as a clean, organized log in 2019 &mdash; date, mileage, service, cost. Maybe you even color-coded it.
              </p>
              <p>
                Then you skipped an entry because you were in a hurry. Then the columns got wider. Then you added a second tab for the new car. Then you couldn&apos;t find it because it&apos;s buried in a folder called <span className="text-white font-mono text-base px-1.5 py-0.5 bg-white/5 rounded">&quot;Car Stuff&quot;</span> inside another folder called <span className="text-white font-mono text-base px-1.5 py-0.5 bg-white/5 rounded">&quot;Misc&quot;</span> on a laptop you barely open anymore.
              </p>
              <p>
                And when it came time to sell your car, you sent the buyer a link to a Google Sheet with missing rows, inconsistent formatting, and no receipts attached. <span className="text-white font-bold">They offered you $2,000 under asking.</span>
              </p>
              <p className="text-zinc-400 italic border-l-2 border-red-600/30 pl-6">
                Spreadsheets are free. They&apos;re flexible. They&apos;re what you know. But they&apos;re also the reason your car&apos;s history looks less impressive than it actually is.
              </p>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Spreadsheets vs GarageBook</h2>
              <div className="h-1 w-20 bg-red-600 mx-auto rounded-full" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0 rounded-2xl border border-white/5 bg-zinc-900/30">
                <thead>
                  <tr>
                    <th className="p-5 border-b border-white/5 text-sm font-black uppercase tracking-widest text-zinc-500">What You Need</th>
                    <th className="p-5 border-b border-white/5 text-sm font-black uppercase tracking-widest text-zinc-500">Spreadsheet</th>
                    <th className="p-5 border-b border-white/5 text-sm font-black uppercase tracking-widest text-zinc-500 bg-red-600/5">GarageBook Free</th>
                    <th className="p-5 border-b border-white/10 text-sm font-black uppercase tracking-widest text-red-500 bg-red-600/10">GarageBook Pro</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <ComparisonRow 
                    label="Log maintenance records"
                    spreadsheet={<Status value="maybe" text="Manual entry" />}
                    free={<Status value="yes" text="Quick-entry forms" />}
                    pro={<Status value="yes" text="Same + AI import" />}
                  />
                  <ComparisonRow 
                    label="Track modifications"
                    spreadsheet={<Status value="maybe" text="If you add columns" />}
                    free={<Status value="yes" text="Dedicated tracker" />}
                    pro={<Status value="yes" text="Same" />}
                  />
                  <ComparisonRow 
                    label="Track expenses"
                    spreadsheet={<Status value="maybe" text="If you add more columns" />}
                    free={<Status value="yes" text="Built-in expense log" />}
                    pro={<Status value="yes" text="Same" />}
                  />
                  <ComparisonRow 
                    label="Receipt photos attached"
                    spreadsheet={<Status value="no" />}
                    free={<Status value="yes" text="Photo uploads" />}
                    pro={<Status value="yes" text="Unlimited photos" />}
                  />
                  <ComparisonRow 
                    label="Search and filter history"
                    spreadsheet={<Status value="maybe" text="Ctrl+F, maybe" />}
                    free={<Status value="yes" text="Searchable timeline" />}
                    pro={<Status value="yes" text="Same" />}
                  />
                  <ComparisonRow 
                    label="Works well on your phone"
                    spreadsheet={<Status value="no" />}
                    free={<Status value="yes" text="Mobile-first design" />}
                    pro={<Status value="yes" text="Same" />}
                  />
                  <ComparisonRow 
                    label="Look up VIN details"
                    spreadsheet={<Status value="no" />}
                    free={<Status value="yes" text="Auto-decode" />}
                    pro={<Status value="yes" text="Same" />}
                  />
                  <ComparisonRow 
                    label="Professional resale report"
                    spreadsheet={<Status value="no" />}
                    free={<Status value="no" />}
                    pro={<Status value="yes" text="PDF & Excel reports" />}
                  />
                  <ComparisonRow 
                    label="Import old spreadsheets"
                    spreadsheet={<Status value="no" />}
                    free={<Status value="no" />}
                    pro={<Status value="yes" text="AI column mapping" />}
                  />
                  <ComparisonRow 
                    label="Multiple vehicles"
                    spreadsheet={<Status value="yes" text="Multiple tabs" />}
                    free={<Status value="no" text="1 vehicle" />}
                    pro={<Status value="yes" text="Unlimited" />}
                  />
                  <ComparisonRow 
                    label="Shareable with a buyer"
                    spreadsheet={<Status value="maybe" text="Awkward link" />}
                    free={<Status value="no" />}
                    pro={<Status value="yes" text="Polished PDF" />}
                  />
                  <ComparisonRow 
                    label="Total investment summary"
                    spreadsheet={<Status value="maybe" text="Manual sum" />}
                    free={<Status value="yes" text="Auto-calculated" />}
                    pro={<Status value="yes" text="Auto-calculated" />}
                    isLast
                  />
                </tbody>
              </table>
            </div>
            <p className="mt-8 text-center text-zinc-500 italic">
              Spreadsheets can do a lot &mdash; if you never miss an entry, never lose the file, never need a receipt photo, never sell your car, and never open it on a phone. GarageBook handles the rest.
            </p>
          </section>

          {/* The Resale Value Argument */}
          <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase leading-tight">
                Prove Your Value <br />
                <span className="text-red-600">When It Matters Most</span>
              </h2>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                  When a buyer comes to see your car, they&apos;re looking for reasons to pay less. A messy spreadsheet &mdash; or worse, no records at all &mdash; gives them one.
                </p>
                <p>
                  A GarageBook Pro ownership report changes the conversation. Instead of &quot;trust me, I changed the oil,&quot; you hand them a formatted PDF with every service dated, every part listed, every receipt attached.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 rounded-3xl border border-white/10 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black px-4 py-1 rounded-full text-xs shadow-lg">
                PRO FEATURE
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 rounded bg-red-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Ownership History Report</h3>
                <p className="text-sm text-zinc-400">
                  Full service timeline, modification history, and total investment breakdown. The ultimate resale tool.
                </p>
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                    <Check className="h-3 w-3 text-emerald-500" />
                    PROFESSIONALLY FORMATTED
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                    <Check className="h-3 w-3 text-emerald-500" />
                    ALL RECEIPTS INCLUDED
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The 15-Year Spreadsheet Graveyard */}
          <section className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 md:p-12 mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="h-1.5 w-8 bg-red-600 rounded-full" />
              The 15-Year Spreadsheet Graveyard
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <TimelinePoint year="Year 1" text="You create the spreadsheet. Tabs for maintenance, mods, and fuel. It&apos;s beautiful." />
              <TimelinePoint year="Year 3" text="You&apos;ve missed about 40% of entries. The oil change column has three different date formats." />
              <TimelinePoint year="Year 7" text="The spreadsheet is on an old laptop. Receipts are in a fading shoebox. The car has a new owner." />
              <TimelinePoint year="Year 15" text="You own a different car. The spreadsheet and shoebox are gone. Your history is a guess." />
            </div>
            <p className="mt-10 text-zinc-400 text-lg leading-relaxed text-center max-w-3xl mx-auto">
              This isn&apos;t a hypothetical. It&apos;s what happens when car documentation relies on a tool never designed for the job. Spreadsheets don&apos;t remind you. They don&apos;t attach photos. They don&apos;t look professional.
            </p>
          </section>

          {/* You Don&apos;t Have to Start Over */}
          <section className="bg-red-600 rounded-[2.5rem] p-8 md:p-12 mb-16 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
              <Zap className="h-64 w-64" />
            </div>
            <div className="relative z-10 space-y-6 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">You Don&apos;t Have to Start Over</h2>
              <p className="text-lg font-medium opacity-90 leading-relaxed">
                If you&apos;ve already got years of data in a spreadsheet, the thought of re-entering everything is exhausting. That&apos;s why GarageBook Pro includes AI-powered import.
              </p>
              <p className="text-base opacity-80 leading-relaxed">
                Upload your Excel or CSV, and our AI reads your columns &mdash; even if they&apos;re labeled &quot;Odo&quot; instead of &quot;Mileage&quot;. Your history moves over in minutes, not days.
              </p>
            </div>
          </section>

          {/* Final CTA */}
          <section className="text-center py-10 space-y-8">
            <h2 className="text-4xl font-black tracking-tighter">START TRACKING &mdash; <span className="text-red-600">FREE</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              GarageBook Free covers one car with full maintenance, modification, and expense tracking. No credit card. No time limit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-black h-16 px-12 text-xl shadow-[0_0_30px_rgba(220,38,38,0.4)] border-none">
                  JOIN THE GARAGE
                </Button>
              </Link>
            </div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              Better doesn&apos;t have to cost anything.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-red-600 text-white">
              <Car className="h-4 w-4" />
            </span>
            <span>GarageBook</span>
          </Link>
          <div className="flex items-center gap-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
          <p className="text-xs text-zinc-600 font-medium font-mono uppercase tracking-tighter">
            © 2026 GARAGEBOOK.APP · BUILT FOR DRIVERS
          </p>
        </div>
      </footer>
    </div>
  )
}

function ComparisonRow({ 
  label, 
  spreadsheet, 
  free, 
  pro, 
  isLast 
}: { 
  label: string, 
  spreadsheet: React.ReactNode, 
  free: React.ReactNode, 
  pro: React.ReactNode,
  isLast?: boolean
}) {
  return (
    <tr className={isLast ? "" : "border-b border-white/5"}>
      <td className="p-5 font-bold text-zinc-400">{label}</td>
      <td className="p-5 text-zinc-500">{spreadsheet}</td>
      <td className="p-5 bg-red-600/5">{free}</td>
      <td className="p-5 bg-red-600/10 font-bold">{pro}</td>
    </tr>
  )
}

function Status({ value, text }: { value: 'yes' | 'no' | 'maybe', text?: string }) {
  const Icon = value === 'yes' ? Check : value === 'no' ? X : Minus
  const color = value === 'yes' ? 'text-emerald-500' : value === 'no' ? 'text-zinc-700' : 'text-zinc-500'
  
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      {text && <span className="text-xs md:text-sm">{text}</span>}
    </div>
  )
}

function TimelinePoint({ year, text }: { year: string, text: string }) {
  return (
    <div className="space-y-2">
      <div className="text-red-600 font-black tracking-tighter text-xl">{year}</div>
      <p className="text-sm text-zinc-400 leading-relaxed">{text}</p>
    </div>
  )
}
