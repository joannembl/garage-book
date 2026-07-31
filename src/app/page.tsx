import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  Car, 
  Wrench, 
  Sliders, 
  Receipt, 
  Sparkles, 
  ChevronRight, 
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/app/actions/auth'

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
            <a href="#pro" className="hover:text-white transition-colors">Pro</a>
          </nav>

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

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-20 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-600/20 to-transparent blur-3xl rounded-full" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-red-500 mb-8 animate-fade-in">
              <Sparkles className="h-3 w-3 fill-red-500" />
              <span>LAUNCHING V1.0 — THE ULTIMATE CAR LOGBOOK</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 leading-[1.1]">
              Document Your Build. <br />
              <span className="text-red-600">Protect Your Value.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
              The mobile-first platform for car enthusiasts. Track every maintenance record, modification, and expense with professional precision.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-10 text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] border-none">
                  Start Your Garage
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-14 px-10 text-lg backdrop-blur-sm">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="mt-20 relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/50 p-2 shadow-2xl backdrop-blur-sm overflow-hidden animate-fade-in-up">
              <div className="aspect-[16/9] bg-[#0c0c0c] rounded-xl border border-white/5 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 to-transparent pointer-events-none" />
                <div className="text-center p-8">
                   <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 mx-auto mb-4 border border-red-600/20 group-hover:scale-110 transition-transform duration-500">
                     <Car className="h-10 w-10" />
                   </div>
                   <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-1">Preview Mode</p>
                   <p className="text-xl font-bold">Comprehensive Vehicle Timeline</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 uppercase">Engineered for Performance</h2>
              <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Wrench className="h-6 w-6 text-red-600" />}
                title="Maintenance Tracking"
                description="Log every oil change, brake job, and service. Get reminders when upkeep is due."
              />
              <FeatureCard 
                icon={<Sliders className="h-6 w-6 text-red-600" />}
                title="Build Logs"
                description="Document your modifications. Track part numbers, costs, and install dates for your project car."
              />
              <FeatureCard 
                icon={<Zap className="h-6 w-6 text-red-600" />}
                title="AI Import"
                description="Instantly convert messy spreadsheets into clean logbooks using our AI mapping technology."
              />
              <FeatureCard 
                icon={<FileText className="h-6 w-6 text-red-600" />}
                title="Pro Reports"
                description="Generate professional PDF reports of your service history to prove value when it's time to sell."
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

        {/* Pro Section */}
        <section id="pro" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-600/5 pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 relative z-10 border border-red-600/20 rounded-[2.5rem] bg-zinc-950/50 p-8 md:p-16 backdrop-blur-md">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black tracking-widest uppercase mb-6">
                  GarageBook Pro
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Unleash the <br /><span className="text-red-600">Full Experience</span></h2>
                <ul className="space-y-4 mb-8">
                   <ProFeatureItem text="Unlimited Vehicle Profiles" />
                   <ProFeatureItem text="AI-Assisted Spreadsheet Imports" />
                   <ProFeatureItem text="Unlimited Photo Storage for Receipts" />
                   <ProFeatureItem text="Advanced PDF & Excel Exports" />
                </ul>
              </div>
              <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl group-hover:bg-red-600/20 transition-colors" />
                 <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Annual Membership</p>
                 <div className="flex items-baseline gap-1 mb-6">
                   <span className="text-5xl font-black">$39</span>
                   <span className="text-zinc-500 font-bold text-xl">/year</span>
                 </div>
                 <Link href="/signup">
                   <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-14 text-lg border-none">
                     Go Pro Today
                   </Button>
                 </Link>
                 <p className="text-center text-[11px] text-zinc-500 mt-4 font-medium uppercase tracking-tighter">Secure Checkout Powered by Stripe</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <section className="py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10">READY TO START YOUR <span className="text-red-600 italic">COLLECTION?</span></h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/signup">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 font-black h-16 px-12 text-xl rounded-full border-none">
                  JOIN THE GARAGE
                </Button>
             </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
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
          <p className="text-xs text-zinc-600 font-medium font-mono">
            © 2026 GARAGEBOOK.APP • BUILT FOR DRIVERS
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
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function ProFeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-zinc-300 font-medium">
      <ShieldCheck className="h-5 w-5 text-red-600 shrink-0" />
      <span>{text}</span>
    </li>
  )
}
