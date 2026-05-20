import { Link } from "react-router-dom";
import { Trees as Tree, Menu, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "brand"), (snapshot) => {
      if (snapshot.exists()) {
        setLogoUrl(snapshot.data().logoUrl || "");
      }
    });
    return () => unsub();
  }, []);

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Struktur", path: "/#struktur" },
    { name: "Dokumentasi", path: "/dokumentasi" },
    { name: "Pendaftaran", path: "/pendaftaran" },
  ];

  return (
    <nav className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-[1.5rem] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xl">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="bg-blue-600 p-1 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 overflow-hidden flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Tree className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white">
            PRAMUKA <span className="text-blue-400">AJM</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="text-sm font-medium text-white/60 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              {link.name}
            </a>
          ))}
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-white/10 text-white hover:bg-white/10 bg-transparent">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden absolute top-20 left-0 right-0 glass rounded-[2rem] shadow-2xl p-6 flex flex-col gap-4 mx-2"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium p-3 text-white border-b border-white/5 last:border-0"
              >
                {link.name}
              </a>
            ))}
            <Link to="/admin" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-6 font-bold shadow-lg shadow-blue-500/20">
                Dashboard Admin
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
