import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  History, 
  AlertTriangle, 
  X, 
  Plus, 
  Mic, 
  FileText,
  Edit2,
  Search,
  UserPlus,
  ArrowUpRight
} from 'lucide-react';
import { Screen, AuthUser } from './Shared';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import Fuse from 'fuse.js';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function NewPrescription({ user, setScreen }: { user: AuthUser, setScreen: (s: Screen) => void }) {
  const [symptoms, setSymptoms] = useState(['Fever', 'Headache', 'Nausea']);
  const doctorId = user.email;
  const suggestions = ['Cough', 'Fatigue', 'Body Ache'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // New Patient Form
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Male');

  // Fetch initial batch of patients for local fuzzy search
  useEffect(() => {
    const fetchPatients = async () => {
      if (!doctorId) return;
      setIsLoadingPatients(true);
      try {
        const q = query(
          collection(db, 'patients'), 
          where('doctor_id', '==', doctorId),
          limit(500) // Increase as needed
        );
        const snap = await getDocs(q);
        const patients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllPatients(patients);
      } catch (e) {
        console.error("Error fetching patients:", e);
      } finally {
        setIsLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allPatients, {
      keys: ['name', 'phone'],
      threshold: 0.3,
      distance: 100,
    });
  }, [allPatients]);

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = fuse.search(searchQuery).map(r => r.item);
    setSearchResults(results.slice(0, 5)); // Show top 5 suggestions
  }, [searchQuery, fuse]);

  const handleCreatePatient = async () => {
    if (!newName || !newAge || !doctorId) return;
    try {
      const docRef = await addDoc(collection(db, 'patients'), {
        doctor_id: doctorId,
        name: newName,
        age: parseInt(newAge),
        gender: newGender,
        allergies: [],
        conditions: [],
        last_visited: serverTimestamp()
      });
      const p = { id: docRef.id, name: newName, age: newAge, gender: newGender };
      setSelectedPatient(p);
      setAllPatients(prev => [p, ...prev]);
      setShowAddPatient(false);
    } catch (e) {
      console.error("Error creating patient:", e);
    }
  };

  const handleGenerateAiSuggestions = async () => {
    if (symptoms.length === 0) return;
    setIsAiLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these symptoms: ${symptoms.join(', ')}, suggest 3 possible provisional diagnoses. Return only the names of the diagnoses as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const results = JSON.parse(response.text || '[]');
      setAiSuggestions(results);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10 pb-24">
      {/* Stepper */}
      <nav aria-label="Progress" className="mb-10">
        <ol className="flex items-center space-x-4">
          <li className="flex items-center">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950 text-white text-xs font-bold shrink-0">1</span>
            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-zinc-950">Start</span>
          </li>
          <li className="flex-auto h-px bg-zinc-200"></li>
          <li className="flex items-center opacity-40">
            <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-300 text-zinc-500 font-bold text-xs shrink-0">2</span>
            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Medicines</span>
          </li>
          <li className="flex-auto h-px bg-zinc-200 hidden md:block opacity-40"></li>
          <li className="hidden md:flex items-center opacity-40">
            <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-300 text-zinc-500 font-bold text-xs shrink-0">3</span>
            <span className="ml-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Review</span>
          </li>
        </ol>
      </nav>

      {/* Title */}
      <section>
        <h1 className="font-serif text-4xl font-bold mb-1">New Prescription</h1>
        <p className="text-zinc-500 font-medium text-lg">Record symptoms and establish a provisional diagnosis.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Context */}
        <div className="lg:col-span-4 space-y-6">
          {!selectedPatient ? (
            <div className="clinical-card p-6 border-zinc-950 border-2 relative">
              <h3 className="font-serif text-xl font-bold mb-4 italic">Patient Context</h3>
              
              {!showAddPatient ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="text" 
                      placeholder={isLoadingPatients ? "Syncing records..." : "Search patient name..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium outline-none focus:border-zinc-950 transition-all shadow-inner"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-1 p-1 bg-zinc-50 rounded-xl border border-zinc-100"
                      >
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-2 py-1">Intelligent Suggestions</p>
                        {searchResults.map((p, idx) => (
                          <motion.div 
                            key={p.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                              setSelectedPatient(p);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="p-3 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all flex justify-between items-center group"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-zinc-950 group-hover:text-red-600 transition-colors uppercase tracking-tight">{p.name}</span>
                              <span className="text-[10px] text-zinc-400 font-medium">ID: {p.id.slice(0, 8)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded uppercase">{p.age}{p.gender?.[0]}</span>
                              <ArrowUpRight size={14} className="text-zinc-200 group-hover:text-red-600 transition-all" />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => setShowAddPatient(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-200 text-zinc-400 hover:text-zinc-950 hover:border-zinc-950 transition-all rounded-xl text-[10px] font-bold uppercase tracking-[0.2em]"
                  >
                    <UserPlus size={16} /> Register New
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium outline-none focus:border-zinc-950" />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Age" value={newAge} onChange={e => setNewAge(e.target.value)} className="w-1/2 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium outline-none focus:border-zinc-950" />
                    <select value={newGender} onChange={e => setNewGender(e.target.value)} className="w-1/2 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold outline-none focus:border-zinc-950">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setShowAddPatient(false)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Cancel</button>
                    <button onClick={handleCreatePatient} className="flex-1 py-3 bg-zinc-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Create Record</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="clinical-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-950"></div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Authenticated Identity</p>
                  <h2 className="font-serif text-3xl font-bold leading-tight uppercase tracking-tight">{selectedPatient.name}</h2>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Clinical Context</span>
                  <span className="text-xs font-bold text-zinc-700">{selectedPatient.age}Y • {selectedPatient.gender} • {selectedPatient.blood_group || '--'}</span>
                </div>
              </div>

              {selectedPatient.allergies?.length > 0 && (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                    <AlertTriangle size={14} className="animate-pulse" />
                    High Risk Warnings
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((a: string) => (
                      <span key={a} className="px-3 py-1 bg-white border border-red-200 text-red-600 font-mono text-[9px] font-bold rounded-lg shadow-sm">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Symptoms */}
          <section className="clinical-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-3xl font-bold">Observed Symptoms</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Multi-select or type custom findings</p>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-2 hover:underline">
                <History size={16} /> Load Patterns
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <AnimatePresence mode="popLayout">
                {symptoms.map((s, idx) => (
                  <motion.button 
                    key={`sym-${s}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => setSymptoms(symptoms.filter((_, i) => i !== idx))}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-white rounded-2xl text-xs font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95 group"
                  >
                    {s} <X size={14} className="opacity-40 group-hover:opacity-100" />
                  </motion.button>
                ))}
              </AnimatePresence>
              
              {suggestions.map((s, idx) => (
                !symptoms.includes(s) && (
                  <button 
                    key={`sug-${s}`}
                    onClick={() => setSymptoms([...symptoms, s])}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-2xl text-xs font-bold hover:border-zinc-950 hover:text-zinc-950 hover:bg-white transition-all transform hover:-translate-y-0.5"
                  >
                    {s} <Plus size={14} />
                  </button>
                )
              ))}
              <div className="inline-flex items-center bg-zinc-50 border border-dotted border-zinc-300 rounded-2xl px-5 py-2.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 transition-all">
                <Plus size={14} className="text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Custom Finding..." 
                  className="text-xs font-bold outline-none bg-transparent ml-2 w-32 placeholder:text-zinc-300" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setSymptoms([...symptoms, e.currentTarget.value]);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Diagnosis */}
          <section className="clinical-card p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-3xl font-bold">Provisional Diagnosis</h2>
              <button 
                onClick={handleGenerateAiSuggestions}
                disabled={isAiLoading || symptoms.length === 0}
                className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 hover:underline disabled:opacity-50"
              >
                {isAiLoading ? 'Analyzing...' : 'Suggest via AI'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6">Expert diagnostic summary for pharmacy validation</p>
            
            <div className="relative group mb-6">
              <textarea 
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-zinc-50 rounded-3xl p-8 text-lg font-medium focus:outline-none focus:border-red-100 focus:bg-white min-h-[220px] transition-all resize-none shadow-inner leading-relaxed"
                placeholder="e.g., Acute viral pharyngitis with secondary mild dehydration and history of recurrent tonsillitis..."
              ></textarea>
              <div className="absolute bottom-6 right-6 flex gap-3">
                <button title="Clinical Template" className="p-3 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-950 transition-all shadow-lg hover:scale-110"><FileText size={20} className="text-zinc-400" /></button>
                <button title="Voice Analytics" className="p-3 bg-white border border-zinc-100 rounded-2xl hover:border-zinc-950 transition-all shadow-lg hover:scale-110"><Mic size={20} className="text-zinc-400" /></button>
              </div>
            </div>

            <AnimatePresence>
              {aiSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">AI Diagnostic Hypotheses</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((sug, i) => (
                      <button 
                        key={i}
                        onClick={() => setDiagnosis(sug)}
                        className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2"
                      >
                        {sug} <Plus size={12} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-white/70 backdrop-blur-2xl border-t border-zinc-100 flex justify-end gap-6 z-40">
        <button className="px-10 py-4 rounded-2xl border border-zinc-200 text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all">Save Intelligence Draft</button>
        <button 
          onClick={() => setScreen('PRESCRIPTION_BUILDER')}
          disabled={!selectedPatient}
          className="px-10 py-4 rounded-2xl bg-red-600 text-white text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          Build Medication Plan <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

