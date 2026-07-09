import { motion } from 'motion/react';
import { AlertTriangle, Clock, History, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function PatientCard({ patient, onClick, active }: { patient: any; onClick?: () => void; active?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all cursor-pointer",
        active ? "bg-zinc-950 border-zinc-950 text-white shadow-lg" : "bg-white border-zinc-100 hover:border-zinc-300"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold", 
          active ? "bg-white/10" : "bg-zinc-100")}>
          {patient.name?.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-sm leading-tight">{patient.name}</h4>
          <p className={cn("text-[10px] font-medium opacity-60 uppercase tracking-wider", 
            active ? "text-white" : "text-zinc-500")}>
            {patient.age}{patient.gender?.[0]} • {patient.blood_group || '--'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function RiskIndicator({ level, message }: { level: 'safe' | 'caution' | 'danger'; message: string }) {
  const colors = {
    safe: "bg-emerald-50 text-emerald-700 border-emerald-100",
    caution: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100"
  };
  
  return (
    <div className={cn("px-3 py-2 rounded-lg border text-[10px] font-bold flex items-center gap-2", colors[level])}>
      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
        level === 'safe' ? "bg-emerald-500" : level === 'caution' ? "bg-amber-500" : "bg-red-500")} 
      />
      {message}
    </div>
  );
}

export function DosageTimeline({ schedule }: { schedule: { morning?: boolean; afternoon?: boolean; night?: boolean } }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex-1 h-8 rounded-lg flex items-center justify-center border text-[10px] font-bold uppercase", 
        schedule.morning ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-zinc-50 border-zinc-100 text-zinc-300")}>
        Morning 🌅
      </div>
      <div className={cn("flex-1 h-8 rounded-lg flex items-center justify-center border text-[10px] font-bold uppercase", 
        schedule.afternoon ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-zinc-50 border-zinc-100 text-zinc-300")}>
        Afternoon ☀️
      </div>
      <div className={cn("flex-1 h-8 rounded-lg flex items-center justify-center border text-[10px] font-bold uppercase", 
        schedule.night ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-zinc-50 border-zinc-100 text-zinc-300")}>
        Night 🌙
      </div>
    </div>
  );
}
