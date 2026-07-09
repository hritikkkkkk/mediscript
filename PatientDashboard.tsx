import { motion } from 'motion/react';
import { 
  Activity, 
  Shield, 
  Zap, 
  Smartphone, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  Stethoscope,
  Clock,
  Heart
} from 'lucide-react';
import { Screen } from './Shared';

export default function LandingPage({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-red-100 selection:text-red-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-serif text-xl font-bold">D</div>
            <span className="font-serif text-2xl font-black tracking-tight">Dr. Sahab</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-widest">Features</a>
            <a href="#impact" className="text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-widest">Impact</a>
            <a href="#about" className="text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-colors uppercase tracking-widest">About</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('LOGIN')}
              className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('LOGIN')} // For demo, both lead to same entry point
              className="px-6 py-2.5 bg-zinc-950 text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all active:scale-95 shadow-xl"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Zap size={12} fill="currentColor" /> Next-Gen Clinical Intelligence
            </div>
            <h1 className="font-serif text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              Empower Your <span className="text-zinc-400">Practice.</span> <br />
              Heal Your <span className="text-red-600 italic">Workflow.</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium mb-10 max-w-lg leading-relaxed">
              Dr. Sahab is a high-fidelity clinical management platform designed for the modern physician. Seamlessly bridge clinical expertise with intelligent automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate('LOGIN')}
                className="group relative px-8 py-5 bg-red-600 text-white rounded-full font-serif text-xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-[0_20px_40px_rgba(220,38,38,0.2)]"
              >
                Start Free Trial
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-5 border border-zinc-200 rounded-full font-serif text-xl font-bold hover:bg-zinc-50 transition-all">
                Book a Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-red-600/5 blur-[120px] rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop" 
              alt="Clinical Interface" 
              className="relative rounded-3xl shadow-2xl border border-zinc-100 object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-2xl border border-zinc-100 flex items-center gap-4 max-w-xs animate-bounce-slow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Efficiency Boost</p>
                <p className="text-lg font-serif font-bold text-zinc-950">+42% Clinical Output</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-24 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-6xl font-serif font-black mb-2">12M+</p>
              <p className="text-xs font-bold uppercase tracking-[.4em] text-zinc-500">Prescriptions Issued</p>
            </div>
            <div>
              <p className="text-6xl font-serif font-black mb-2">45k+</p>
              <p className="text-xs font-bold uppercase tracking-[.4em] text-zinc-500">Active Clinicians</p>
            </div>
            <div>
              <p className="text-6xl font-serif font-black mb-2">99.9%</p>
              <p className="text-xs font-bold uppercase tracking-[.4em] text-zinc-500">System Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-extrabold uppercase tracking-[.5em] text-red-600 mb-4 italic">Capabilities</p>
            <h2 className="font-serif text-5xl md:text-6xl font-black tracking-tight mb-6">Designed for Clinical <span className="text-zinc-300">Excellence.</span></h2>
          </div>

          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-zinc-50 rounded-3xl p-10 border border-zinc-100 group hover:bg-white transition-all cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8">
                <Stethoscope size={28} className="text-red-600" />
              </div>
              <h3 className="text-3xl font-serif font-black mb-4 group-hover:text-red-600 transition-colors">Smart Diagnosis Engine</h3>
              <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-xl">
                Our proprietary AI models analyze patient history and symptoms to provide real-time diagnostic hypotheses, reducing cognitive load for better outcomes.
              </p>
            </div>
            <div className="md:col-span-4 bg-zinc-950 rounded-3xl p-10 text-white flex flex-col justify-between">
              <Activity size={40} className="text-red-600" />
              <div>
                <h3 className="text-2xl font-serif font-black mb-2">Real-time Vitals</h3>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Connect with IoT healthcare devices for live tracking.</p>
              </div>
            </div>
            <div className="md:col-span-4 bg-red-600 rounded-3xl p-10 text-white flex flex-col justify-between h-80">
              <Shield size={40} className="text-white/40" />
              <div>
                <h3 className="text-2xl font-serif font-black mb-2">Military-Grade Security</h3>
                <p className="text-white/60 text-sm font-bold">HIPAA & GDPR compliant data encryption for patient privacy.</p>
              </div>
            </div>
            <div className="md:col-span-8 bg-zinc-50 rounded-3xl p-10 border border-zinc-100 flex items-center gap-12 group hover:bg-white transition-all">
              <div className="hidden lg:block w-48 h-48 rounded-full border-8 border-zinc-100 border-t-red-600 animate-spin-slow"></div>
              <div>
                <h3 className="text-3xl font-serif font-black mb-4">Patient-Centric Portal</h3>
                <p className="text-lg text-zinc-500 font-medium">Digital prescriptions, automated dosage reminders, and simple appointment booking for your patients.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white relative">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="mb-12">
            <Heart size={64} fill="currentColor" className="text-red-600 mx-auto animate-pulse" />
          </div>
          <h2 className="font-serif text-6xl md:text-8xl font-black tracking-tighter leading-none mb-12">
            Are you ready to <span className="text-zinc-300 underline">evolve?</span>
          </h2>
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="px-16 py-8 bg-zinc-950 text-white rounded-full font-serif text-3xl font-bold hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            Get Started Now
          </button>
          <p className="mt-8 text-zinc-400 font-bold uppercase tracking-[.3em] text-[10px]">No credit card required for 14-day trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-serif text-sm font-bold">D</div>
              <span className="font-serif text-xl font-bold tracking-tight">Dr. Sahab</span>
            </div>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">
              Global clinical management standards. <br />
              Crafted for healthcare professionals.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-600">
              <li className="hover:text-red-600 cursor-pointer">Features</li>
              <li className="hover:text-red-600 cursor-pointer">Intelligence</li>
              <li className="hover:text-red-600 cursor-pointer">Security</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-zinc-600">
              <li className="hover:text-red-600 cursor-pointer">Mission</li>
              <li className="hover:text-red-600 cursor-pointer">Careers</li>
              <li className="hover:text-red-600 cursor-pointer">Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Social</h4>
            <div className="flex gap-4">
              <Smartphone size={20} className="text-zinc-300 hover:text-red-600 transition-colors cursor-pointer" />
              <Zap size={20} className="text-zinc-300 hover:text-red-600 transition-colors cursor-pointer" />
              <Users size={20} className="text-zinc-300 hover:text-red-600 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
