import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Structure } from "@/components/Structure";
import { RegistrationForm } from "@/components/RegistrationForm";
import { useState, createContext, useContext, useEffect } from "react";
import { AdminDashboard } from "@/src/pages/Admin/Dashboard";
import { AdminLogin } from "@/src/pages/Admin/Login";
import { Dokumentasi } from "@/src/pages/Dokumentasi";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AnimatePresence, motion } from "motion/react";

// Mock Auth Context
const AuthContext = createContext<{
  isLoggedIn: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}>({
  isLoggedIn: false,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="glow-orb top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20" />
      <div className="glow-orb bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10" />
      
      <Navbar />
      <main className="relative z-10">{children}</main>
      <footer className="py-12 bg-white/5 border-t border-white/10 text-center relative z-10">
        <p className="text-white/40 text-sm">
          &copy; Created By @wilden_ofcl | 2026 GERAKAN PRAMUKA AJM SMKN 2 GARUT.
        </p>
      </footer>
    </div>
  );
}

function HomePage() {
  const [footerCta, setFooterCta] = useState({
    title: "Siap Menjadi Pemimpin Masa Depan?",
    subtitle: "Mari asah kemampuanmu dan jalin persaudaraan di GERAKAN PRAMUKA AJM SMKN 2 GARUT.",
    buttonText: "Daftar Sekarang"
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "footer"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFooterCta(prev => ({
          title: data.title || prev.title,
          subtitle: data.subtitle || prev.subtitle,
          buttonText: data.buttonText || prev.buttonText
        }));
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      <Hero />
      <Structure />
      <div className="relative py-20 md:py-28 px-6 text-center bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden border-t border-white/5">
          {/* Backlighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none animate-pulse-intense" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 animate-shimmer-bg tracking-tight drop-shadow-md">
              {footerCta.title}
            </h2>
            <p className="max-w-2xl mx-auto mb-10 text-xs sm:text-sm md:text-base text-blue-200/60 leading-relaxed font-medium">
              {footerCta.subtitle}
            </p>
            <Link to="/pendaftaran" className="inline-block w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 px-10 py-5 rounded-xl sm:rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer"
              >
                {footerCta.buttonText}
              </motion.button>
            </Link>
          </div>
      </div>
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Artificial delay for loading screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const login = (u: string, p: string) => {
    if (u === "admin" && p === "admin2026") {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      {!isLoading && (
        <Router>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/pendaftaran" element={<MainLayout><RegistrationForm /></MainLayout>} />
            <Route path="/dokumentasi" element={<MainLayout><Dokumentasi /></MainLayout>} />
            <Route 
              path="/admin" 
              element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
            />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </Router>
      )}
    </AuthContext.Provider>
  );
}
