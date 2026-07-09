import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Bell, 
  HelpCircle,
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

// --- Types ---
export type Screen = 'LANDING' | 'LOGIN' | 'DASHBOARD' | 'PATIENT_PROFILE' | 'NEW_PRESCRIPTION' | 'PRESCRIPTION_BUILDER' | 'PATIENT_DASHBOARD';

export interface AuthUser {
  email: string;
  role: 'doctor' | 'patient';
  name?: string;
  patientId?: string;
  token: string;
  firebaseToken?: string;
}

export const getAuthToken = () => localStorage.getItem('dr_sahab_auth_token');
export const setAuthToken = (token: string) => localStorage.setItem('dr_sahab_auth_token', token);
export const clearAuthToken = () => localStorage.removeItem('dr_sahab_auth_token');

// --- Mock Data ---
export const MOCK_PATIENTS = [
  { id: 'RK-9921', name: 'Ramesh Kumar', age: 62, gender: 'Male', initial: 'RK', status: 'Waiting', diagnosis: 'Hypertension Follow-up' },
  { id: 'SR-1022', name: 'Sarah Rogers', age: 42, gender: 'Female', initial: 'SR', status: 'Pending Rx', diagnosis: 'Acute Bronchitis' },
  { id: 'MK-5521', name: 'Michael Chen', age: 28, gender: 'Male', initial: 'MK', status: 'Completed', diagnosis: 'Routine Checkup' },
  { id: 'EL-8849', name: 'Elena Lopez', age: 55, gender: 'Female', initial: 'EL', status: 'Completed', diagnosis: 'Hypertension Follow-up' },
];

export const MOCK_RX_HISTORY = [
  { date: 'OCT 12, 2023', title: 'Hypertension Follow-up', notes: 'Patient reports mild dizziness in the mornings. Adjusted dosage of Amlodipine.', medicines: ['Amlodipine 5mg', 'Metoprolol 25mg'] },
  { date: 'SEP 05, 2023', title: 'General Checkup', notes: 'Routine checkup. BP slightly elevated. Continuing current medication regimen.', medicines: ['Amlodipine 2.5mg'] },
];

// --- Sub-components ---

export function Sidebar({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) {
  const items = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'PATIENT_PROFILE', label: 'Patients', icon: Users },
    { id: 'PRESCRIPTION_BUILDER', label: 'Prescriptions', icon: FileText },
    { id: 'SCHEDULE', label: 'Schedule', icon: Calendar },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white border-r border-zinc-100 shadow-[4px_0_20px_rgba(0,0,0,0.05)] py-6 z-40">
      <div className="px-6 pb-6 border-b border-zinc-50 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-brand text-white flex items-center justify-center font-serif text-xl font-bold">D</div>
        <div>
          <h1 className="font-serif text-xl font-black tracking-tight">Dr. Sahab</h1>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Clinical Management</p>
        </div>
      </div>
      
      <div className="flex-1 px-2 space-y-1">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => setScreen(item.id as Screen)}
            className={`flex items-center gap-3 px-4 py-3 rounded-r-lg cursor-pointer transition-all ${currentScreen === item.id ? 'bg-zinc-100 border-r-4 border-primary-brand font-bold text-primary-dark' : 'text-zinc-500 hover:bg-zinc-50 hover:translate-x-1'}`}
          >
            <item.icon size={20} className={currentScreen === item.id ? 'text-primary-brand' : ''} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="px-4 mt-auto">
        <button 
          onClick={() => setScreen('NEW_PRESCRIPTION')}
          className="w-full bg-primary-brand text-white rounded-lg py-3 px-4 font-bold text-sm shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Prescription
        </button>
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-1">
          <div className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer rounded-r-lg text-sm">
            <HelpCircle size={18} /> Support
          </div>
          <div onClick={() => setScreen('LOGIN')} className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer rounded-r-lg text-sm">
            <LogOut size={18} /> Logout
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Navbar({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#111111] text-white z-50 flex items-center justify-between px-6 md:pl-[17rem]">
      <div className="flex items-center gap-4 md:hidden">
        <Menu size={24} className="text-zinc-400" />
        <span className="font-serif text-xl font-bold">Dr. Sahab</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, drugs, codes..." 
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-brand focus:ring-1 focus:ring-primary-brand transition-all placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-brand rounded-full border border-[#111111]"></span>
        </button>
        <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-white leading-tight">Dr. Sahab, MD</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Internal Medicine</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" 
            alt="Doctor" 
            className="w-9 h-9 rounded-full object-cover border border-primary-brand shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}

export function MobileNav({ setScreen }: { setScreen: (s: Screen) => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-zinc-100 flex items-center justify-around z-50">
      <button onClick={() => setScreen('DASHBOARD')} className="flex flex-col items-center text-primary-brand">
        <LayoutDashboard size={20} />
        <span className="text-[10px] mt-1 font-bold">Home</span>
      </button>
      <button onClick={() => setScreen('PATIENT_PROFILE')} className="flex flex-col items-center text-zinc-400">
        <Users size={20} />
        <span className="text-[10px] mt-1 font-bold">Patients</span>
      </button>
      <button onClick={() => setScreen('NEW_PRESCRIPTION')} className="flex flex-col items-center -mt-6 bg-primary-brand text-white p-3 rounded-full shadow-lg">
        <Plus size={24} />
      </button>
      <button onClick={() => setScreen('PRESCRIPTION_BUILDER')} className="flex flex-col items-center text-zinc-400">
        <FileText size={20} />
        <span className="text-[10px] mt-1 font-bold">History</span>
      </button>
      <button className="flex flex-col items-center text-zinc-400">
        <Settings size={20} />
        <span className="text-[10px] mt-1 font-bold">Settings</span>
      </button>
    </nav>
  );
}
