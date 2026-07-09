import { motion } from 'motion/react';
import { 
  FileText, 
  Calendar, 
  Bell, 
  LogOut, 
  Heart, 
  Activity,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Screen, AuthUser, clearAuthToken } from './Shared';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function PatientDashboard({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user.patientId) return;
      try {
        // Fetch Prescriptions
        const rxQ = query(
          collection(db, 'prescriptions'),
          where('patient_id', '==', user.patientId),
          orderBy('created_at', 'desc')
        );
        const rxSnap = await getDocs(rxQ);
        setPrescriptions(rxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Reminders
        const remQ = query(
          collection(db, 'reminders'),
          where('patient_id', '==', user.patientId),
          where('status', '==', 'pending'),
          orderBy('date', 'asc')
        );
        const remSnap = await getDocs(remQ);
        setReminders(remSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.patientId]);

  const handleLogout = () => {
    clearAuthToken();
    setScreen('LANDING');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-950 pb-20">
      {/* Header */}
      <header className="bg-zinc-950 text-white p-8 pb-16 rounded-b-[3rem]">
        <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-serif text-xl font-bold">D</div>
            <span className="font-serif text-xl font-bold">Dr. Sahab</span>
          </div>
          <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] mb-2 italic">Patient Portal Access</p>
          <h1 className="text-4xl md:text-5xl font-serif font-black mb-2">Hello, {user.name || 'Guest'}</h1>
          <p className="text-zinc-400 font-medium">Manage your clinical records and follow-ups securely.</p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
            <Activity size={20} className="text-red-600 mb-2" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vitality</p>
            <p className="text-lg font-serif font-bold">Active</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
            <FileText size={20} className="text-zinc-600 mb-2" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Records</p>
            <p className="text-lg font-serif font-bold">{prescriptions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
            <Bell size={20} className="text-amber-500 mb-2" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reminders</p>
            <p className="text-lg font-serif font-bold">{reminders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
            <Heart size={20} className="text-emerald-500 mb-2" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status</p>
            <p className="text-lg font-serif font-bold">Stable</p>
          </div>
        </div>

        {/* Reminders Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 italic">Upcoming Follow-ups</h2>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <Clock size={14} className="text-zinc-400" />
            </div>
          </div>
          <div className="space-y-3">
            {reminders.length > 0 ? reminders.map((rem, idx) => (
              <motion.div 
                key={rem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-950">{rem.message || 'Follow-up Consultation'}</h3>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">{rem.date}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-amber-300" />
              </motion.div>
            )) : (
              <div className="bg-zinc-50 border border-dashed border-zinc-200 p-10 rounded-3xl text-center">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No pending reminders</p>
              </div>
            )}
          </div>
        </section>

        {/* Prescription History */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-950 italic">Medical Records</h2>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <FileText size={14} className="text-zinc-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.length > 0 ? prescriptions.map((rx, idx) => (
              <motion.div 
                key={rx.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(rx.created_at?.toDate()).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-serif font-bold mb-2 uppercase tracking-tight">{rx.diagnosis || 'Clinical Prescription'}</h3>
                <p className="text-xs text-zinc-500 font-medium mb-4 line-clamp-2">{rx.symptoms?.join(', ') || 'General review'}</p>
                <div className="flex flex-wrap gap-1">
                  {rx.medicines?.slice(0, 3).map((m: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-zinc-50 text-[9px] font-bold text-zinc-400 rounded-lg border border-zinc-100 uppercase">{m.name}</span>
                  ))}
                  {rx.medicines?.length > 3 && <span className="text-[9px] font-bold text-zinc-300">+{rx.medicines.length - 3} more</span>}
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full bg-zinc-50 border border-dashed border-zinc-200 p-20 rounded-3xl text-center">
                <FileText size={48} className="text-zinc-200 mx-auto mb-4" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No prescriptions found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
