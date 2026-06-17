import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function LoadingScreen() {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "brand"), (snapshot) => {
      if (snapshot.exists()) {
        setLogoUrl(snapshot.data().logoUrl || "");
      }
    });
    return () => unsub();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#0A0A0B] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo/Icon Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20 relative z-10 overflow-hidden">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 0.9, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="w-full h-full flex items-center justify-center p-1"
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-12 h-12 text-white"
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              )}
            </motion.div>
          </div>
          
          {/* Animated Rings */}
          <div className="absolute inset-0 -m-4 border border-white/5 rounded-full animate-[ping_3s_linear_infinite]" />
          <div className="absolute inset-0 -m-8 border border-white/5 rounded-full animate-[ping_4s_linear_infinite]" />
        </motion.div>

        {/* Text Animation */}
        <div className="text-center space-y-2">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl font-bold tracking-tight text-white font-display"
          >
            GERAKAN PRAMUKA SMKN 2 GARUT
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: "circOut" }}
            className="h-[2px] w-48 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xs uppercase tracking-[0.3em] font-medium text-white"
          >
            PRAMUKA AJM
          </motion.p>
        </div>

        {/* Loading Progress Bar */}
        <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}
