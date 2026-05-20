import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Code, Hammer, Camera, Landmark } from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Member {
  id?: string;
  name: string;
  role: string;
  photoUrl: string;
  divisionId: string;
  order: number;
}

interface Division {
  id: string;
  name: string;
  icon: string;
  order: number;
  members: Member[];
}

const ICON_MAP: Record<string, any> = {
  Landmark,
  Hammer,
  Camera,
  Code,
  Users,
  User
};

export function Structure() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    hasMoved.current = false;
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // speed multiplier
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch events for actual mobile performance
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    hasMoved.current = false;
    const touch = e.touches[0];
    setStartX(touch.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const touch = e.touches[0];
    const x = touch.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // speed multiplier
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    // Run background silent migration to clean up Firestore divisions if needed
    const migrateDivisionsIfNeeded = async () => {
      try {
        await setDoc(doc(db, "structure_divisions", "inti"), {
          name: "Dewan Ambalan",
          icon: "Landmark",
          order: 1
        }, { merge: true });

        await setDoc(doc(db, "structure_divisions", "tekpram"), {
          name: "Calon Dewan Ambalan",
          icon: "Hammer",
          order: 2
        }, { merge: true });

        await setDoc(doc(db, "structure_divisions", "humas"), {
          name: "Calon Bantara",
          icon: "User",
          order: 3
        }, { merge: true });

        // Delete "Digital & IT"
        await deleteDoc(doc(db, "structure_divisions", "it"));
      } catch (err) {
        console.error("Silent sync error:", err);
      }
    };
    migrateDivisionsIfNeeded();

    // Fetch Divisions
    const qDiv = query(collection(db, "structure_divisions"), orderBy("order", "asc"));
    const unsubDiv = onSnapshot(qDiv, (divSnapshot) => {
      const divData = divSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(div => div.id !== "it") as any[];

      // Fetch Members for all divisions
      const qMem = query(collection(db, "structure_members"), orderBy("order", "asc"));
      const unsubMem = onSnapshot(qMem, (memSnapshot) => {
        const memData = memSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Member[];

        // Combine and map correct labels in UI
        const combined = divData.map(div => {
          let customName = div.name;
          if (div.id === "inti") customName = "Dewan Ambalan";
          if (div.id === "tekpram") customName = "Calon Dewan Ambalan";
          if (div.id === "humas") customName = "Calon Bantara";
          
          return {
            ...div,
            name: customName,
            members: memData.filter(m => m.divisionId === div.id)
          };
        });

        setDivisions(combined);
        if (combined.length > 0 && !activeTab) {
          setActiveTab(combined[0].id);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching structure members:", error);
      });

      return () => unsubMem();
    }, (error) => {
      console.error("Error fetching structure divisions:", error);
    });

    return () => unsubDiv();
  }, [activeTab]);

  const activeDivision = divisions.find(d => d.id === activeTab);

  if (loading) {
    return (
      <div className="py-32 flex justify-center items-center text-white/50">
        <p className="animate-pulse">Loading Struktur...</p>
      </div>
    );
  }

  return (
    <section id="struktur" className="relative py-32 px-6 bg-pramuka-blue-dark overflow-hidden">
      {/* Absolute Ambient shapes on background */}
      <div className="absolute top-1/3 right-[-10%] w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[-10%] w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-20">
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            STRUKTUR DEWAN AMBALAN
          </Badge>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tighter text-white">
            Kepengurusan Periode <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 animate-shimmer-bg drop-shadow-[0_2px_15px_rgba(59,130,246,0.3)]">2026/2027</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Sinergi antar divisi untuk menciptakan gerakan pramuka yang lebih inovatif dan berdampak bagi masyarakat luas.
          </p>
        </div>

        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-4 sm:mb-16 p-1.5 sm:p-2 glass rounded-2xl sm:rounded-[2.5rem] w-full sm:w-fit mx-auto overflow-x-auto no-scrollbar whitespace-nowrap select-none cursor-grab active:cursor-grabbing touch-pan-x"
        >
          {divisions.map((division) => {
            const Icon = ICON_MAP[division.icon] || Users;
            return (
              <button
                key={division.id}
                onClick={(e) => {
                  if (hasMoved.current) {
                    e.preventDefault();
                    return;
                  }
                  setActiveTab(division.id);
                }}
                className={`flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-[2rem] text-[10px] sm:text-sm font-bold transition-all uppercase tracking-widest flex-shrink-0 ${
                  activeTab === division.id
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {division.name}
              </button>
            );
          })}
        </div>

        {/* Mobile Swipe / Slider Indicator */}
        <div className="sm:hidden flex items-center justify-center gap-1.5 text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-10 animate-pulse bg-blue-500/5 py-2 px-5 rounded-full border border-blue-500/10 w-fit mx-auto" style={{ contentVisibility: 'auto' }}>
          <span>← Geser / Slide Tombol Di Atas →</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {activeDivision?.members.map((member, index) => (
              <motion.div
                key={`${member.id}-${index}`}
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ 
                  duration: 0.45, 
                  ease: "easeOut",
                  delay: index * 0.04
                }}
                layout
              >
                <Card className="p-2 glass border-white/5 hover:border-blue-500/30 transition-all duration-500 rounded-[2rem] relative overflow-hidden group shadow-lg hover:shadow-blue-500/10">
                  {/* Glass Shimmer Reflection Glaze Effect */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                  <div className="aspect-[3/4] relative bg-zinc-900/50 overflow-hidden rounded-2xl">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <Users className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-3 text-center relative">
                    <h3 className="font-display font-bold text-sm text-white mb-0.5 tracking-tight truncate group-hover:text-blue-300 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest truncate">
                      {member.role}
                    </p>
                    <div className="mt-2 pt-2 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                       <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-white/60">{activeDivision.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

