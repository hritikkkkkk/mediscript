import { useState, useEffect } from 'react';
import { Screen, Sidebar, Navbar, MobileNav, AuthUser, getAuthToken, clearAuthToken } from './components/Shared';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import NewPrescription from './components/NewPrescription';
import PrescriptionBuilder from './components/PrescriptionBuilder';
import LandingPage from './components/LandingPage';
import PatientDashboard from './components/PatientDashboard';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './lib/firebase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LANDING');
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const authUser = { ...data.user, token, firebaseToken: data.firebaseToken };
          setUser(authUser);
          
          if (data.firebaseToken) {
            await signInWithCustomToken(auth, data.firebaseToken);
          }
          
          setCurrentScreen(data.user.role === 'doctor' ? 'DASHBOARD' : 'PATIENT_DASHBOARD');
        } else {
          clearAuthToken();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setInitializing(false);
      }
    };
    verifyUser();
  }, []);

  const handleLogin = async (userData: AuthUser | Screen) => {
    if (typeof userData === 'string') {
      setCurrentScreen(userData);
    } else {
      setUser(userData);
      
      if (userData.firebaseToken) {
        try {
          await signInWithCustomToken(auth, userData.firebaseToken);
        } catch (e) {
          console.error("Firebase Auth Error:", e);
        }
      }
      
      setCurrentScreen(userData.role === 'doctor' ? 'DASHBOARD' : 'PATIENT_DASHBOARD');
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LANDING':
        return <LandingPage onNavigate={setCurrentScreen} />;
      case 'LOGIN':
        return <LoginScreen onLogin={handleLogin} />;
      case 'PATIENT_DASHBOARD':
        return user ? <PatientDashboard user={user} setScreen={setCurrentScreen} /> : <LoginScreen onLogin={handleLogin} />;
      case 'DASHBOARD':
        return <Dashboard user={user!} setScreen={setCurrentScreen} />;
      case 'PATIENT_PROFILE':
        return <PatientProfile user={user!} setScreen={setCurrentScreen} />;
      case 'NEW_PRESCRIPTION':
        return <NewPrescription user={user!} setScreen={setCurrentScreen} />;
      case 'PRESCRIPTION_BUILDER':
        return <PrescriptionBuilder user={user!} setScreen={setCurrentScreen} />;
      default:
        return <Dashboard user={user!} setScreen={setCurrentScreen} />;
    }
  };

  if (currentScreen === 'LOGIN' || currentScreen === 'LANDING' || currentScreen === 'PATIENT_DASHBOARD') {
    return renderScreen();
  }

  // Wraps clinical screens with common Navigation/Header
  return (
    <div className="min-h-screen bg-surface-light text-primary-dark">
      <Sidebar currentScreen={currentScreen} setScreen={setCurrentScreen} />
      
      <div className="md:ml-64 relative min-h-screen">
        <Navbar setScreen={setCurrentScreen} />
        
        <main className="pt-20 pb-24 md:pb-8">
          {renderScreen()}
        </main>
        
        <MobileNav setScreen={setCurrentScreen} />
      </div>
    </div>
  );
}

