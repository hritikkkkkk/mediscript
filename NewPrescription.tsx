import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Users as UsersIcon,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  History,
  ChevronRight,
  ClipboardList,
  Plus,
  ArrowUpRight,
  Stethoscope,
  Bell
} from 'lucide-react';
import { Screen, AuthUser } from './Shared';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const MOCK_CHART_DATA = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 24 },
  { day: 'Fri', count: 20 },
  { day: 'Sat', count: 8 },
  { day: 'Sun', count: 5 },
];

const MOCK_TOP_DISEASES = [
  { name: 'Hypertension', value: 45, color: '#dc2626' },
  { name: 'Diabetes', value: 32, color: '#ef4444' },
  { name: 'Fever', value: 24, color: '#f87171' },
  { name: 'Thyroid', value: 18, color: '#fca5a5' },
];

export default function Dashboard({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [patientCount, setPatientCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [todayPrescriptionCount, setTodayPrescriptionCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [pendingReminders, setPendingReminders] = useState<any[]>([]);
  const doctorId = user.email;

  useEffect(() => {
    if (!doctorId) return;

    const fetchData = async () => {
      try {
        // ... (existing patient/rx counts)
        const patientsRef = collection(db, 'patients');
        const qPatients = query(patientsRef, where('doctor_id', '==', doctorId));
        const patientsSnap = await getDocs(qPatients);
        setPatientCount(patientsSnap.size);

        const rxRef = collection(db, 'prescriptions');
        const qRx = query(rxRef, where('doctor_id', '==', doctorId));
        const rxSnap = await getDocs(qRx);
        setPrescriptionCount(rxSnap.size);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const qTodayRx = query(
          rxRef, 
          where('doctor_id', '==', doctorId), 
          where('created_at', '>=', startOfDay)
        );
        const todayRxSnap = await getDocs(qTodayRx);
        setTodayPrescriptionCount(todayRxSnap.size);

        // Reminders
        const remindersRef = collection(db, 'reminders');
        const qReminders = query(
          remindersRef,
          where('doctor_id', '==', doctorId),
          where('status', '==', 'pending'),
          orderBy('date', 'asc'),
          limit(5)
        );
        const remindersSnap = await getDocs(qReminders);
        setPendingReminders(remindersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Recent patients
        const qRecent = query(
          patientsRef, 
          where('doctor_id', '==', doctorId), 
          orderBy('last_visited', 'desc'),
          limit(5)
        );
        const recentSnap = await getDocs(qRecent);
        setRecentPatients(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error("Dashboard data fetch error:", e);
      }
    };

    fetchData();
  }, [doctorId]);

  const stats = [
    { 
      label: "Today's RX Volume", 
      value: todayPrescriptionCount.toString(), 
      change: `+${todayPrescriptionCount} issued today`, 
      icon: ClipboardList, 
      color: "bg-red-50 text-red-600 border-red-100",
      trend: "up" 
    },
    { 
      label: "Total Patient Registry", 
      value: patientCount.toString(), 
      change: "Active records", 
      icon: UsersIcon, 
      color: "bg-amber-50 text-amber-600 border-amber-100",
      trend: "stable" 
    },
    { 
      label: "Cumulative Diagnostics", 
      value: prescriptionCount.toString(), 
      change: "Total Rx Issued", 
      icon: TrendingUp, 
      color: "bg-zinc-50 text-zinc-950 border-zinc-100",
      trend: "up" 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-5xl font-medium tracking-tight mb-2">
            Welcome, <span className="font-bold text-black">{user.name || 'Dr. Sahab'}</span>
          </h2>
          <p className="text-zinc-500 font-medium text-lg">Your clinical intelligence suite is updated with today's trends.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-2">
            <ClipboardList size={16} /> Clinical Report
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 rounded-3xl border flex flex-col justify-between h-48 hover:shadow-2xl transition-all cursor-pointer group",
              stat.color
            )}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="font-bold text-[10px] tracking-[0.2em] uppercase opacity-70 italic">{stat.label}</span>
                <div className="flex items-center gap-2">
                   <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-black/5">
                    <stat.icon size={18} />
                   </div>
                </div>
              </div>
              <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-zinc-400" />
            </div>
            <div className="flex items-end justify-between">
              <span className="font-mono text-6xl font-black tracking-tighter leading-none">{stat.value}</span>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase opacity-60 block">Status</span>
                <span className="text-xs font-bold">{stat.change}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[400px]">
        {/* Prescription Activity Chart */}
        <section className="lg:col-span-8 clinical-card p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-serif text-2xl font-bold">Activity Pulse</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Prescription volume (7 Days)</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                Rx Output
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#a1a1aa' }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#dc2626" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Diagnosis Mix */}
        <section className="lg:col-span-4 clinical-card p-8 flex flex-col">
          <h3 className="font-serif text-2xl font-bold mb-6">Diagnosis Mix</h3>
          <div className="space-y-6 flex-1">
            {MOCK_TOP_DISEASES.map((disease, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">{disease.name}</span>
                  <span className="text-zinc-950">{disease.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${disease.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: disease.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-6 border-t border-zinc-100 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 hover:text-black transition-colors flex items-center justify-center gap-2">
            Full Analytics <ArrowUpRight size={14} />
          </button>
        </section>
      </div>

      {/* Quick Actions & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar for Dashboard */}
        <div className="lg:col-span-3 space-y-4">
           <h3 className="font-serif text-xl font-bold mb-6 italic">Workflow</h3>
           <div className="space-y-2">
            <button 
              onClick={() => setScreen('NEW_PRESCRIPTION')}
              className="w-full flex items-center justify-between p-4 bg-red-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center gap-3">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span className="text-sm">Quick Rx</span>
              </div>
              <ArrowUpRight size={16} className="opacity-50" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl font-bold hover:border-zinc-300 transition-all text-sm">
               <div className="flex items-center gap-3">
                <UsersIcon size={20} className="text-zinc-400" />
                <span>Patient Registry</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl font-bold hover:border-zinc-300 transition-all text-sm">
               <div className="flex items-center gap-3">
                <History size={20} className="text-zinc-400" />
                <span>Audit Logs</span>
              </div>
            </button>
           </div>
           
           {pendingReminders.length > 0 && (
             <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
               <div className="flex items-center gap-2 mb-4">
                 <Bell size={16} className="text-amber-600" />
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Pending Follow-ups</h4>
               </div>
               <div className="space-y-3">
                 {pendingReminders.map(rem => (
                   <div key={rem.id} className="bg-white/50 p-3 rounded-xl border border-amber-200/50">
                     <p className="text-[10px] font-bold text-zinc-950">{rem.patient_name}</p>
                     <p className="text-[10px] text-zinc-500">{rem.message || 'Follow-up'}</p>
                     <p className="text-[9px] font-bold text-amber-600 mt-1">{rem.date}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* Live List */}
        <section className="lg:col-span-9 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-serif text-2xl font-bold">Clinical Queue</h3>
              <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest mt-1">Live active sessions</p>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline">Full Queue</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPatients.length > 0 ? recentPatients.map((patient: any, i) => (
              <motion.div 
                key={patient.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                onClick={() => setScreen('PATIENT_PROFILE')}
                className="clinical-card p-6 flex items-center justify-between gap-4 cursor-pointer group hover:border-zinc-950 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center font-serif text-2xl font-bold text-zinc-300 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950 transition-all">
                    {patient.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight group-hover:text-zinc-950 transition-colors">{patient.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{patient.age}{patient.gender ? patient.gender[0] : ''}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{patient.diagnosis || 'Follow-up'}</span>
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-zinc-200 group-hover:text-zinc-950 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-16 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                <Stethoscope size={48} className="mx-auto text-zinc-200 mb-4" />
                <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Clinical queue is empty.</p>
                <button 
                  onClick={() => setScreen('NEW_PRESCRIPTION')}
                  className="mt-4 px-6 py-2 bg-zinc-950 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Register Patient
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

