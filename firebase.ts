import { RiskIndicator, DosageTimeline } from './ClinicalComponents';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  Search, 
  Plus, 
  FileText, 
  History, 
  Pill, 
  Stethoscope, 
  Sun, 
  Moon, 
  RefreshCw,
  Printer,
  Send,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Info,
  AlertTriangle,
  X,
  Share2,
  Trash2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Screen, AuthUser } from './Shared';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as QRCode from 'qrcode.react';
import jsPDF from 'jspdf';

export default function PrescriptionBuilder({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const doctorId = user.email;
  const [medQuery, setMedQuery] = useState('');
  const [medResults, setMedResults] = useState<any[]>([]);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [diagnosis, setDiagnosis] = useState('Essential primary hypertension (I10)');
  const [patient, setPatient] = useState<any>(null);
  
  // Dosing State refined
  const [dosageConfig, setDosageConfig] = useState({
    strength: '',
    type: 'TAB',
    dose: '1',
    frequency: '1-0-1',
    duration: '5',
    timing: 'After Food',
    method: 'Oral'
  });

  const medicineTypes = ['TAB', 'SYP', 'CAP', 'INJ', 'CRM', 'DRP'];
  const frequencies = ['1-0-0', '0-1-0', '0-0-1', '1-1-1', '1-0-1', 'SOS'];
  const timings = ['After Food', 'Before Food', 'With Food', 'Empty Stomach'];
  const followUpDate = ''; // We can add state for this
  const [viewMode, setViewMode] = useState<'DOCTOR' | 'PATIENT'>('DOCTOR');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      if (!doctorId) return;
      const q = query(collection(db, 'patients'), where('doctor_id', '==', doctorId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const pData: any = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setPatient(pData);
        if (pData.allergies?.length) {
          setAlerts([{ id: 1, type: 'critical', message: 'Allergy Conflict', detail: `Patient is allergic to: ${pData.allergies.join(', ')}` }]);
        }
      }
    };
    fetchContext();
  }, [doctorId]);

  const searchMedicines = async () => {
    if (medQuery.length < 2) return;
    const q = query(collection(db, 'medicines'), where('name', '>=', medQuery), where('name', '<=', medQuery + '\uf8ff'));
    const snap = await getDocs(q);
    setMedResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const applyTemplate = (type: 'FEVER' | 'COUGH' | 'BP') => {
    const templates = {
      FEVER: [{ id: Date.now(), name: 'Paracetamol', strength: '500 mg', frequency: '1-1-1', duration: '3', timing: 'After Food' }],
      COUGH: [{ id: Date.now(), name: 'Ascoril D', strength: '5 ml', frequency: '1-1-1', duration: '5', timing: 'After Food' }],
      BP: [{ id: Date.now(), name: 'Amlodipine', strength: '5 mg', frequency: '1-0-0', duration: '30', timing: 'Empty Stomach' }]
    };
    setPrescriptionItems([...prescriptionItems, ...templates[type]]);
    setShowTemplates(false);
  };

  const addMedication = () => {
    if (!selectedMed) return;
    const newItem = {
      id: Date.now(),
      name: selectedMed.name,
      ...dosageConfig
    };
    setPrescriptionItems([...prescriptionItems, newItem]);
    setSelectedMed(null);
    setMedQuery('');
    setMedResults([]);
  };

  const removeMed = (id: number) => setPrescriptionItems(items => items.filter(i => i.id !== id));

  const signAndIssue = async () => {
    if (!patient || prescriptionItems.length === 0 || !doctorId) return;
    
    try {
      const rxRef = await addDoc(collection(db, 'prescriptions'), {
        doctor_id: doctorId,
        patient_id: patient.id,
        diagnosis,
        created_at: serverTimestamp()
      });

      for (const item of prescriptionItems) {
        await addDoc(collection(db, 'prescription_items'), {
          prescription_id: rxRef.id,
          ...item
        });
      }

      alert('Prescription saved successfully!');
      setScreen('DASHBOARD');
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.text('Dr. Sahab Prescription', 20, 20);
    doc.setFontSize(10);
    doc.text(`Patient: ${patient?.name}`, 20, 30);
    doc.text(`Diagnosis: ${diagnosis}`, 20, 35);
    doc.text('Medicines:', 20, 45);
    
    prescriptionItems.forEach((item, i) => {
      doc.text(`${i+1}. ${item.name} (${item.strength}) - ${item.frequency} for ${item.duration} days`, 25, 55 + (i * 10));
    });
    
    doc.save(`Prescription_${patient?.name}.pdf`);
  };

  const shareWhatsApp = () => {
    const text = `Prescription for ${patient?.name}\nDiagnosis: ${diagnosis}\nMedicines:\n${prescriptionItems.map((m, i) => `${i+1}. ${m.name} (${m.strength})`).join('\n')}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const removeAlert = (id: number) => setAlerts(prev => prev.filter(a => a.id !== id));

  if (!patient) return <div className="h-full flex items-center justify-center">Loading patient context...</div>;

  return (
    <div className="h-full flex overflow-hidden bg-zinc-50">
      {/* Pane 1: Context (Left) */}
      <aside className="w-[300px] flex flex-col gap-6 shrink-0 h-full p-6 overflow-y-auto border-r border-zinc-100">
        {/* Patient Detail Card */}
        <div className="clinical-card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2188&auto=format&fit=crop" 
              alt="Eleanor Vance" 
              className="w-20 h-20 rounded-full border-4 border-zinc-50"
            />
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <h2 className="font-serif text-xl font-bold leading-tight">{patient.name}</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{patient.age} Yrs • {patient.gender} • ID: {patient.id.slice(0, 8)}</p>
          
          <div className="w-full mt-6 pt-4 border-t border-zinc-50 grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Blood Type</p>
              <p className="text-xs font-mono font-bold">{patient.blood_group || 'Not Set'}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Weight / Height</p>
              <p className="text-xs font-mono font-bold">{patient.weight || '--'} kg / -- cm</p>
            </div>
          </div>
        </div>

        {/* Vitals Snapshot */}
        <div className="clinical-card p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Current Vitals</h3>
            <span className="text-[8px] text-zinc-400 font-bold uppercase">10m ago</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase mb-1">
                <Heart size={10} className="text-red-500" /> BP
              </div>
              <p className="text-sm font-mono font-bold text-red-600">142/90</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase mb-1">
                <Thermometer size={10} /> Temp
              </div>
              <p className="text-sm font-mono font-bold">37.2<span className="text-[10px] ml-0.5 opacity-40">°C</span></p>
            </div>
          </div>
        </div>

        {/* Clinical Note Block */}
        <div className="clinical-card p-4 flex-1 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest">Medical Context</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[8px] font-bold text-zinc-400 uppercase mb-2">Chronic Conditions</p>
              <div className="space-y-2">
                {['Hypertension (HTN)', 'Type 2 Diabetes'].map((cond, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-lg text-xs font-medium text-zinc-700 border border-zinc-100">
                    {cond} <Info size={12} className="text-zinc-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Pane 2: Workspace (Center) */}
      <section className="flex-1 flex flex-col min-w-0 bg-white shadow-[0_0_10px_rgba(0,0,0,0.05)] z-10">
        <header className="h-16 flex items-center justify-between px-8 bg-zinc-50/50 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl font-bold">Clinical Builder</h1>
            <div className="flex bg-zinc-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('DOCTOR')}
                className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", viewMode === 'DOCTOR' ? "bg-white shadow-sm text-zinc-950" : "text-zinc-400")}
              >
                Clinical
              </button>
              <button 
                onClick={() => setViewMode('PATIENT')}
                className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", viewMode === 'PATIENT' ? "bg-white shadow-sm text-zinc-950" : "text-zinc-400")}
              >
                Patient
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold hover:bg-zinc-50 transition-colors">
              <History size={14} /> / Past
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                <FileText size={14} /> Templates
              </button>
              {showTemplates && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-xl shadow-2xl z-50 overflow-hidden py-2">
                  <div onClick={() => applyTemplate('FEVER')} className="px-4 py-2 hover:bg-zinc-50 cursor-pointer text-xs font-bold">Standard Fever Set</div>
                  <div onClick={() => applyTemplate('BP')} className="px-4 py-2 hover:bg-zinc-50 cursor-pointer text-xs font-bold">Hypertension Basic</div>
                  <div onClick={() => applyTemplate('COUGH')} className="px-4 py-2 hover:bg-zinc-50 cursor-pointer text-xs font-bold">Cough & Cold</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Notes Section */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <Stethoscope size={20} className="text-zinc-950" /> Diagnosis & Clinical Notes
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  id="diag-search"
                  type="text" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950" 
                />
              </div>
              <div className="flex gap-2 p-1">
                <span className="text-[9px] font-bold text-zinc-400">Suggestions:</span>
                {['Follow-up', 'Acute Migraine', 'Viral Fever'].map(s => (
                  <button key={s} onClick={() => setDiagnosis(s)} className="text-[9px] font-bold text-red-600 hover:underline">{s}</button>
                ))}
              </div>
              <textarea 
                className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 h-28 resize-none"
                placeholder="Add clinical observations..."
              ></textarea>
            </div>
          </section>

          <div className="h-px bg-zinc-100"></div>

          {/* Prescription Section */}
          <section className="space-y-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <Pill size={20} className="text-red-600" /> Prescribe Medication
            </h2>

            <div className="relative">
              <div className="flex items-center bg-white border-2 border-zinc-200 rounded-xl focus-within:border-red-600 transition-colors overflow-hidden">
                <Search size={22} className="ml-4 text-zinc-400" />
                <input 
                  id="med-search"
                  type="text" 
                  placeholder="Search medication... (/ to focus)"
                  value={medQuery}
                  onChange={(e) => setMedQuery(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && searchMedicines()}
                  className="w-full px-4 py-4 text-lg font-bold outline-none" 
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest self-center mr-1">Frequent:</span>
                {['Paracetamol', 'Amoxicillin', 'Pantocid', 'Cetirizine'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => { setMedQuery(m); searchMedicines(); }}
                    className="text-[9px] font-bold px-3 py-1 bg-zinc-50 hover:bg-red-50 text-zinc-600 hover:text-red-700 rounded-full border border-zinc-100 transition-all"
                  >
                    {m}
                  </button>
                ))}
              </div>
              
              {medResults.length > 0 && !selectedMed && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-100 rounded-xl shadow-xl z-20 overflow-hidden">
                  {medResults.map(med => (
                    <div 
                      key={med.id}
                      onClick={() => setSelectedMed(med)}
                      className="px-6 py-4 hover:bg-zinc-50 border-b border-zinc-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-950">{med.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">In Formulary</span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium tracking-wide">{med.salt} • {med.type}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMed && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Selected Drug</p>
                  <p className="text-lg font-bold text-zinc-950">{selectedMed.name}</p>
                </div>
                <button onClick={() => setSelectedMed(null)} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Search Filters */}
            <div className="flex flex-wrap gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Formulary Status</label>
                <div className="flex gap-1 p-1 bg-zinc-100/50 rounded-lg border border-zinc-100">
                  <button className="px-3 py-1 bg-white text-zinc-950 text-[10px] font-bold rounded-md shadow-sm border border-zinc-200 cursor-pointer transition-all">All</button>
                  <button className="px-3 py-1 text-zinc-500 text-[10px] font-bold hover:text-zinc-950 transition-colors cursor-pointer">In Formulary</button>
                  <button className="px-3 py-1 text-zinc-500 text-[10px] font-bold hover:text-zinc-950 transition-colors cursor-pointer">Non-Formulary</button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Drug Class</label>
                <div className="relative">
                  <select className="appearance-none bg-white border border-zinc-200 rounded-lg pl-3 pr-8 py-1.5 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-zinc-950 transition-colors cursor-pointer min-w-[140px]">
                    <option>All Classes</option>
                    <option>ACE Inhibitors</option>
                    <option>Statins</option>
                    <option>Beta Blockers</option>
                    <option>Antibiotics</option>
                    <option>Analgesics</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Dose Config Grid */}
            <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl grid grid-cols-12 gap-6">
               <div className="col-span-4 space-y-3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Strength & Type</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={dosageConfig.strength}
                      onChange={e => setDosageConfig({...dosageConfig, strength: e.target.value})}
                      placeholder="500mg"
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold bg-white outline-none focus:border-zinc-950" 
                    />
                    <select 
                      value={dosageConfig.type}
                      onChange={e => setDosageConfig({...dosageConfig, type: e.target.value})}
                      className="bg-white border rounded-lg px-2 text-[10px] font-bold"
                    >
                      {medicineTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
               </div>

               <div className="col-span-8 space-y-3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Frequency Matrix</label>
                  <div className="flex gap-2">
                    {frequencies.map(f => (
                      <button 
                        key={f}
                        onClick={() => setDosageConfig({...dosageConfig, frequency: f})}
                        className={`flex-1 py-3 border rounded-lg text-[10px] font-bold transition-all ${dosageConfig.frequency === f ? 'border-2 border-zinc-950 bg-zinc-100' : 'border-zinc-200 bg-white hover:border-zinc-950'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="col-span-12 grid grid-cols-3 gap-6 pt-2">
                  <div className="col-span-1 space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration</label>
                    <div className="flex border border-zinc-200 rounded-lg overflow-hidden bg-white">
                      <input 
                        type="text" 
                        value={dosageConfig.duration} 
                        onChange={e => setDosageConfig({...dosageConfig, duration: e.target.value})}
                        className="w-full px-3 py-2 text-center font-mono font-bold outline-none" 
                      />
                      <span className="bg-zinc-100 px-3 border-l text-[10px] font-bold flex items-center">DAYS</span>
                    </div>
                  </div>
                 <div className="flex-1 space-y-3 col-span-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Timing & Method</label>
                    <div className="flex gap-2">
                      <select 
                        value={dosageConfig.timing}
                        onChange={e => setDosageConfig({...dosageConfig, timing: e.target.value})}
                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold"
                      >
                        {timings.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input 
                        type="text" 
                        value={dosageConfig.method}
                        onChange={e => setDosageConfig({...dosageConfig, method: e.target.value})}
                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold" 
                      />
                    </div>
                  </div>
               </div>

               <div className="col-span-12 pt-4 flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center">
                      <QRCode.QRCodeSVG value="https://drsahab.ai/verify" size={24} />
                    </div>
                    <p className="text-[10px] font-medium text-zinc-400 leading-tight">Chemist verification QR enabled<br/>Verified Digital Signature Active</p>
                  </div>
                  <button 
                    disabled={!selectedMed}
                    onClick={addMedication}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus size={18} /> Append to Rx
                  </button>
               </div>
            </div>
          </section>
        </div>
      </section>

      {/* Pane 3: Preview (Right) */}
      <aside className="w-[450px] shrink-0 h-full p-8 flex flex-col bg-zinc-100">
        <div className="flex-1 bg-white shadow-2xl rounded-sm p-12 relative overflow-hidden flex flex-col border-t-8 border-red-600">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
            <span className="font-serif text-[300px] -rotate-45">Rx</span>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start border-b border-zinc-200 pb-6 mb-8">
              <div>
                <h2 className="font-serif text-3xl font-black leading-none mb-1">Dr. Sahab</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">MD, Internal Medicine • Reg: 8824-A9</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-bold">24 Oct, 2023</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">NYC Central Clinic</p>
              </div>
            </div>

            <div className="bg-zinc-50/50 p-4 rounded-lg mb-6 border border-zinc-50">
              <p className="font-bold text-zinc-950 mb-1">{patient.name}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dx: {diagnosis}</p>
            </div>

            {/* Clinical Safety Alerts Banner */}
            {alerts.length > 0 && (
              <div className="mb-8 space-y-2">
                {alerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-l-4 flex gap-3 relative group transition-all hover:shadow-md ${
                      alert.type === 'critical' 
                        ? 'bg-red-50 border-red-500 text-red-900 border-y border-r border-y-red-100 border-r-red-100' 
                        : 'bg-amber-50 border-amber-500 text-amber-900 border-y border-r border-y-amber-100 border-r-amber-100'
                    }`}
                  >
                    <AlertTriangle size={18} className={`shrink-0 ${alert.type === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                    <div className="pr-6">
                      <p className="text-[11px] font-bold leading-tight">{alert.message}</p>
                      <p className="text-[10px] opacity-70 mt-0.5 font-medium">{alert.detail}</p>
                    </div>
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mb-6">
              <span className="font-serif text-5xl font-black opacity-10">Rx</span>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto max-h-[400px] pr-2">
              {prescriptionItems.length > 0 ? prescriptionItems.map((item, i) => (
                <div key={item.id} className="pl-6 border-l-2 border-zinc-200 relative group">
                  <div className="flex justify-between items-baseline mb-3">
                    <div>
                      <h4 className="font-bold text-zinc-950 text-lg leading-none">{i + 1}. {item.name}</h4>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.strength}</span>
                    </div>
                    {viewMode === 'DOCTOR' && (
                      <RiskIndicator level="safe" message="No interactions" />
                    )}
                  </div>
                  
                  {viewMode === 'DOCTOR' ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-600 font-medium tracking-wide">Dosage: {item.frequency} for {item.duration} days</p>
                      {item.instructions && <p className="text-[10px] text-zinc-400 italic">“{item.instructions}”</p>}
                    </div>
                  ) : (
                    <div className="space-y-4 py-2">
                      <DosageTimeline schedule={{ 
                        morning: item.frequency.includes('OD') || item.frequency.includes('BD') || item.frequency.includes('TDS'),
                        afternoon: item.frequency.includes('TDS'),
                        night: item.frequency.includes('BD') || item.frequency.includes('HS') || item.frequency.includes('TDS')
                      }} />
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex gap-2 items-center">
                         <Info size={14} className="text-red-500" />
                         <p className="text-xs font-bold text-red-700">Duration: {item.duration} Days • Total: {parseInt(item.duration) * (item.frequency === 'BD' ? 2 : item.frequency === 'TDS' ? 3 : 1)} Pills</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => removeMed(item.id)}
                    className="absolute -left-3 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-600 p-1.5 rounded-full shadow-lg border border-zinc-100 active:scale-95"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )) : (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-3xl gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200">
                    <Pill size={24} />
                  </div>
                  <p className="text-zinc-300 font-bold text-[10px] uppercase tracking-[0.2em] leading-loose text-center">Awaiting clinical input...</p>
                </div>
              )}
            </div>

            <div className="mt-auto border-t border-zinc-100 pt-8 flex justify-end">
              <div className="text-center w-40">
                <div className="h-10 flex items-center justify-center mb-1 font-serif text-2xl font-bold opacity-30 -rotate-2">
                  {user.name || 'Dr. Sahab'}
                </div>
                <div className="border-t border-zinc-950/20 pt-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Digital Auth: {doctorId?.slice(0, 8)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={downloadPDF} className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-center"><Printer size={20} /></button>
          <button onClick={shareWhatsApp} className="p-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-center"><Share2 size={20} /></button>
          <button 
            onClick={signAndIssue}
            className="flex-[3] p-4 bg-zinc-950 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl active:scale-95"
          >
            <Send size={18} /> Sign & Issue Rx
          </button>
        </div>
      </aside>
    </div>
  );
}
