import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { 
  Car, 
  Wrench, 
  Sliders, 
  Receipt, 
  Sparkles, 
  ChevronRight, 
  FileText,
  Zap,
  Check,
  ShieldCheck,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/app/actions/auth'
import { EmailCapture } from '@/components/marketing/EmailCapture'

export const metadata: Metadata = {
  title: 'GarageBook — Digital Logbook for Car Enthusiasts | Track Maintenance, Mods & Expenses',
  description: 'The ultimate digital logbook for car enthusiasts. Track maintenance, modifications, and expenses. Generate professional ownership reports. Free for your first car.',
}

export default async function LandingPage() {
  const user = await getCurrentUser()

  // If already logged in, go straight to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-red-600/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Car className="h-5 w-5" />
            </span>
            <span>
              Garage<span className="text-red-600 font-black">Book</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/compare" className="hover:text-white transition-colors text-red-500 font-bold tracking-tight">Why GarageBook?</Link>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pro" className="hover:text-white transition-colors">Pro</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold hover:bg-white/5">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 shadow-[0_0_15px_rgba(220,38,38,0.3)] border-none">
                Start Tracking — Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Section 1: Hero */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-600/20 to-transparent blur-3xl rounded-full" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-red-500 mb-8 animate-fade-in">
              <Sparkles className="h-3 w-3 fill-red-500" />
              <span>LAUNCHING V1.0 — THE ULTIMATE CAR LOGBOOK</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 leading-[1.1]">
              Your Build. <br />
              <span className="text-red-600 text-6xl md:text-8xl">Logged.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
              The digital logbook that turns your receipts and spreadsheets into a professional ownership history. Free for your first car.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/signup">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-10 text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] border-none">
                  Start Tracking — Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-14 px-10 text-lg backdrop-blur-sm">
                  Explore Features
                </Button>
              </a>
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-20">
              No credit card · 1 car free
            </p>

            {/* Hero Mockup */}
            <div className="relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/50 p-2 shadow-2xl backdrop-blur-sm overflow-hidden animate-fade-in-up">
              <div className="aspect-[16/9] bg-[#0c0c0c] rounded-xl border border-white/5 flex items-center justify-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 to-transparent pointer-events-none" />
                <div className="w-full h-full p-4 md:p-8 flex flex-col gap-6 opacity-40">
                   <div className="h-8 w-48 bg-white/5 rounded-md" />
                   <div className="grid grid-cols-3 gap-4">
                      <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                      <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                      <div className="h-32 bg-white/5 rounded-xl border border-white/5" />
                   </div>
                   <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center p-8">
                      <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 mx-auto mb-4 border border-red-600/20 group-hover:scale-110 transition-transform duration-500">
                        <Car className="h-10 w-10" />
                      </div>
                      <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-1">Interactive Dashboard</p>
                      <p className="text-xl font-bold">Your Entire Fleet in One View</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What You Can Track */}
        <section id="features" className="py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 uppercase">Everything your car deserves to have documented.</h2>
              <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Wrench className="h-6 w-6 text-red-600" />}
                title="Maintenance"
                description="Log every service — oil changes, brakes, timing belts. Attach receipts."
              />
              <FeatureCard 
                icon={<Zap className="h-6 w-6 text-red-600" />}
                title="Modifications"
                description="Track every part you install. Brand, category, cost, notes. Your build documented."
              />
              <FeatureCard 
                icon={<Receipt className="h-6 w-6 text-red-600" />}
                title="Expenses"
                description="Fuel, insurance, registration — know exactly what your car costs to run."
              />
            </div>

            <div className="mt-16 text-center">
               <Link href="/compare" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
                  <span className="text-sm font-bold uppercase tracking-widest">Still using a spreadsheet? See the difference</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </div>
        </section>

        {/* Section 3: Pro Tease */}
        <section className="py-24 relative overflow-hidden bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/5 blur-3xl pointer-events-none" />
               
               <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">Prove your car&apos;s value when it matters most.</h2>
                    <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 mb-8 italic text-zinc-300">
                       &quot;The buyer paid my full asking price because I could show them everything.&quot;
                       <p className="not-italic text-sm font-bold text-zinc-500 mt-4">— Every seller with a documented car</p>
                    </div>
                    <p className="text-lg text-zinc-400 mb-8">
                       Export professional PDF or Excel reports. The ultimate resale tool. Available on Pro ($39/year).
                    </p>
                    <Link href="/signup">
                       <Button variant="outline" className="border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white font-bold">
                          Get Started Today
                       </Button>
                    </Link>
                  </div>
                  <div className="relative group">
                     <div className="absolute -inset-4 bg-red-600/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     <div className="relative aspect-[4/5] max-w-sm mx-auto bg-zinc-800 rounded-xl border border-white/10 shadow-2xl p-6 flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center mb-2">
                           <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="h-4 w-3/4 bg-white/20 rounded" />
                        <div className="h-4 w-1/2 bg-white/10 rounded" />
                        <div className="mt-4 space-y-3">
                           <div className="h-2 w-full bg-white/5 rounded" />
                           <div className="h-2 w-full bg-white/5 rounded" />
                           <div className="h-2 w-3/4 bg-white/5 rounded" />
                        </div>
                        <div className="mt-auto pt-6 border-t border-white/5">
                           <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Ownership History Report</p>
                           <p className="text-xs font-bold text-white mt-1">2024 Porsche 911 GT3</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 4: How It Works */}
        <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 uppercase text-center">From messy to organized in minutes.</h2>
              <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               <StepCard 
                  number="1"
                  title="Add Your Car"
                  description="Enter your VIN (auto-decodes year/make/model) or type it in manually."
               />
               <StepCard 
                  number="2"
                  title="Log as You Go"
                  description="Snap a photo of your receipt. Log the service. Done in 30 seconds."
               />
               <StepCard 
                  number="3"
                  title="Build Your History"
                  description="Every entry builds a timeline. Searchable. Sortable. Exportable."
               />
               <StepCard 
                  number="4"
                  title="Import Your Past"
                  description="Already have a spreadsheet? Our AI reads your columns and imports everything."
                  isPro
               />
            </div>
          </div>
        </section>

        {/* Section 4.5: Email Capture */}
        <section className="py-24 relative overflow-hidden bg-zinc-950/50">
           <div className="max-w-7xl mx-auto px-4 relative z-10">
              <EmailCapture />
           </div>
        </section>

        {/* Section 5: Pricing Table */}
        <section id="pro" className="py-24 bg-zinc-950">
           <div className="max-w-7xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 uppercase">Start free. Upgrade when you&apos;re ready.</h2>
              <p className="text-zinc-400 mb-16">No hidden fees. Designed for enthusiasts.</p>
              
              <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-white/5 bg-zinc-900 shadow-2xl">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="p-6 md:p-8 text-xl font-bold">Features</th>
                          <th className="p-6 md:p-8 text-center bg-white/5">
                             <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">Free</p>
                             <p className="text-2xl font-black">$0</p>
                          </th>
                          <th className="p-6 md:p-8 text-center bg-red-600">
                             <p className="text-sm text-white/70 font-bold uppercase tracking-widest mb-1">Pro</p>
                             <p className="text-2xl font-black">$39<span className="text-lg text-white/50">/yr</span></p>
                          </th>
                       </tr>
                    </thead>
                    <tbody className="text-sm md:text-base">
                       <PricingRow title="Vehicle Profiles" free="1 Vehicle" pro="Unlimited" />
                       <PricingRow title="Maintenance Log" free={<Check className="h-5 w-5 text-emerald-500 mx-auto" />} pro={<Check className="h-5 w-5 text-white mx-auto" />} />
                       <PricingRow title="Modification Log" free={<Check className="h-5 w-5 text-emerald-500 mx-auto" />} pro={<Check className="h-5 w-5 text-white mx-auto" />} />
                       <PricingRow title="Expense Tracking" free={<Check className="h-5 w-5 text-emerald-500 mx-auto" />} pro={<Check className="h-5 w-5 text-white mx-auto" />} />
                       <PricingRow title="Receipt Photos" free="Basic Storage" pro="Unlimited" />
                       <PricingRow title="Professional Reports" free="Basic" pro="PDF & Excel" />
                       <PricingRow title="AI Spreadsheet Import" free="—" pro={<Check className="h-5 w-5 text-white mx-auto" />} />
                       <PricingRow title="Priority Support" free="—" pro={<Check className="h-5 w-5 text-white mx-auto" />} />
                    </tbody>
                    <tfoot>
                       <tr>
                          <td className="p-6 md:p-8 border-t border-white/5"></td>
                          <td className="p-6 md:p-8 text-center bg-white/5 border-t border-white/5">
                             <Link href="/signup">
                                <Button variant="ghost" className="font-bold underline decoration-zinc-700">Get Started</Button>
                             </Link>
                          </td>
                          <td className="p-6 md:p-8 text-center bg-red-600">
                             <Link href="/signup">
                                <Button className="bg-white text-red-600 hover:bg-zinc-100 font-black px-8">Go Pro →</Button>
                             </Link>
                          </td>
                       </tr>
                    </tfoot>
                 </table>
              </div>
           </div>
        </section>

        {/* Section 6: FAQ */}
        <section id="faq" className="py-24 bg-[#0a0a0a]">
           <div className="max-w-3xl mx-auto px-4">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 uppercase text-center text-white">You&apos;ve got questions. We&apos;ve got answers.</h2>
                 <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
              </div>

              <div className="space-y-12">
                 <FAQItem 
                    question="Is this really free?" 
                    answer="Yes. The free tier includes one vehicle, full maintenance/mod/expense tracking, and receipt photo uploads. No credit card required." 
                 />
                 <FAQItem 
                    question="What happens to my data?" 
                    answer="Your data is stored securely in Supabase. You can export everything anytime — PDF, Excel, or raw data. Your data is yours." 
                 />
                 <FAQItem 
                    question="Can I import my existing spreadsheet?" 
                    answer="Yes — with Pro. Upload your Excel or CSV and our AI maps your columns automatically. Preview before importing." 
                 />
                 <FAQItem 
                    question="Does this work on my phone?" 
                    answer="Absolutely. GarageBook is designed mobile-first. Log services, snap receipts, and check your history right from your phone." 
                 />
                 <FAQItem 
                    question="What if I sell my car?" 
                    answer="Export a professional ownership history report and hand it to the buyer. Then remove the car from your garage and add your next one." 
                 />
                 <FAQItem 
                    question="How is this different from a spreadsheet?" 
                    answer="Spreadsheets don't store receipt photos, don't generate professional PDF reports, and aren't fun to use on a phone. GarageBook is purpose-built for car people." 
                 />
              </div>
           </div>
        </section>

        {/* Section 7: Final CTA */}
        <section className="py-32 relative overflow-hidden bg-zinc-950">
           <div className="absolute inset-0 bg-red-600/5" />
           <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase">Ready to document your build?</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                 <Link href="/signup">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-black h-16 px-12 text-xl shadow-[0_0_30px_rgba(220,38,38,0.4)] border-none">
                       Start Tracking — Free
                    </Button>
                 </Link>
              </div>
              <div className="text-zinc-500 font-medium space-y-1">
                 <p>No credit card. 1 car free.</p>
                 <p>Cancel anytime.</p>
              </div>
           </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-red-600 text-white">
              <Car className="h-4 w-4" />
            </span>
            <span>GarageBook</span>
          </div>
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-red-600/30 hover:bg-zinc-900 transition-all duration-300 group">
      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-white">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description, isPro }: { number: string, title: string, description: string, isPro?: boolean }) {
   return (
      <div className="relative p-8 rounded-3xl bg-zinc-900/30 border border-white/5 group hover:border-white/10 transition-colors">
         <div className="text-5xl font-black text-white/5 absolute top-4 right-6 group-hover:text-red-600/10 transition-colors">{number}</div>
         <div className="space-y-4 relative z-10">
            <div className="h-10 w-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 font-black">
               {number}
            </div>
            <h3 className="text-lg font-bold text-white">
               {title} {isPro && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded ml-1 uppercase">Pro</span>}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
         </div>
      </div>
   )
}

function PricingRow({ title, free, pro }: { title: string, free: React.ReactNode, pro: React.ReactNode }) {
   return (
      <tr className="border-b border-white/5">
         <td className="p-6 md:p-8 font-medium text-zinc-400">{title}</td>
         <td className="p-6 md:p-8 text-center bg-white/5 text-zinc-300 font-bold">{free}</td>
         <td className="p-6 md:p-8 text-center bg-red-600/10 text-white font-bold">{pro}</td>
      </tr>
   )
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
   return (
      <div className="space-y-4">
         <h3 className="text-xl font-bold text-white flex items-start gap-3">
            <span className="text-red-600 font-black">Q:</span>
            {question}
         </h3>
         <p className="text-zinc-400 pl-8 leading-relaxed">
            {answer}
         </p>
      </div>
   )
}
