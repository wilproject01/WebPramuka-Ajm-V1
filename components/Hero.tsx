import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Compass, 
  Shield, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Camera,
  FolderHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection } from "firebase/firestore";

const DEFAULT_ACTIVITIES = [
  {
    url: "https://images.unsplash.com/photo-1526620536413-5de78833917d?q=80&w=1000&auto=format&fit=crop",
    title: "Latihan Gabungan"
  },
  {
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop",
    title: "Perkemahan Sabtu Minggu"
  },
  {
    url: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=1000&auto=format&fit=crop",
    title: "Penjelajahan Alam"
  },
  {
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop",
    title: "Pelantikan Penegak"
  }
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hero, setHero] = useState({
    title: "GERAKAN PRAMUKA GUGUS DEPAN 02.095 - 02.096",
    subtitle: "Ambalan Ir. H. Juanda - Laksamana Malahayati || Wadahnya para anak kreatif untuk mengasah keterampilan, kedisiplinan, dan jiwa kepemimpinan di era modern.",
    cta: "JOIN SEKARANG"
  });
  const [stats, setStats] = useState([
    { label: "Dewan Ambalan", value: "0" },
    { label: "Calon Dewan", value: "0" },
    { label: "Calon Bantara", value: "0" }
  ]);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);

  useEffect(() => {
    // Hero Listener
    const unsubHero = onSnapshot(doc(db, "content", "hero"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setHero(prev => ({
          title: data.title || prev.title,
          subtitle: data.subtitle || prev.subtitle,
          cta: data.cta || prev.cta
        }));
      }
    });

    // Dynamic Stats Listener (synchronized with structure_members)
    const unsubStats = onSnapshot(collection(db, "structure_members"), (snapshot) => {
      const membersList = snapshot.docs.map(doc => doc.data());
      const dewanCount = membersList.filter((m: any) => m.divisionId === "inti").length;
      const cadaCount = membersList.filter((m: any) => m.divisionId === "tekpram").length;
      const cabaCount = membersList.filter((m: any) => m.divisionId === "humas").length;

      setStats([
        { label: "Dewan Ambalan", value: `${dewanCount}` },
        { label: "Calon Dewan", value: `${cadaCount}` },
        { label: "Calon Bantara", value: `${cabaCount}` }
      ]);
    });

    // Activities Listener
    const unsubActivities = onSnapshot(doc(db, "content", "activities"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          setActivities(data.items);
        }
      }
    });

    return () => {
      unsubHero();
      unsubStats();
      unsubActivities();
    };
  }, []);

  const nextSlide = () => {
    if (activities.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activities.length);
  };

  const prevSlide = () => {
    if (activities.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activities.length) % activities.length);
  };

  useEffect(() => {
    if (activities.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= activities.length) {
      setCurrentIndex(activities.length - 1);
    }
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [activities.length, currentIndex]);

  const totalAct = activities.length;
  const idxCenter = totalAct > 0 ? currentIndex % totalAct : 0;
  const idxLeft = totalAct > 0 ? (currentIndex - 1 + totalAct) % totalAct : 0;
  const idxRight = totalAct > 0 ? (currentIndex + 1) % totalAct : 0;

  const leftUrl = activities[idxLeft]?.url || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=300&auto=format&fit=crop";
  const leftTitle = activities[idxLeft]?.title || "Camping Momen";

  const rightUrl = activities[idxRight]?.url || "https://images.unsplash.com/photo-1526620536413-5de78833917d?q=80&w=300&auto=format&fit=crop";
  const rightTitle = activities[idxRight]?.title || "Bakti Sosial";

  const centerUrl = activities[idxCenter]?.url || "https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=400&auto=format&fit=crop";
  const centerTitle = activities[idxCenter]?.title || "Album AJM 2026";

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-12 md:pb-20 px-4 sm:px-6 overflow-hidden bg-pramuka-blue-dark">
      {/* Immersive Ambient Glow/Decorative Lights */}
      <div className="absolute top-1/4 left-1/12 w-72 h-72 rounded-full bg-blue-600/10 blur-[120px] animate-pulse-intense pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/12 w-80 h-80 rounded-full bg-indigo-500/10 blur-[130px] animate-float-slow pointer-events-none" />

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-6 sm:mb-8 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-float">
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 animate-spin-slow" style={{ animationDuration: "12s" }} />
            TANDANG JUANG MEUNANG
          </div>
          <h1 className="font-display text-2xl xs:text-3xl sm:text-6xl md:text-8xl font-bold leading-[1.15] md:leading-[1] mb-5 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 animate-shimmer-bg tracking-tighter whitespace-pre-line break-words drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
            {hero.title}
          </h1>
          <p className="text-sm xs:text-base md:text-xl text-white/50 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
            <Link to="/pendaftaran" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-[2rem] px-6 sm:px-10 py-5 sm:py-8 h-auto text-sm sm:text-lg font-bold gap-3 group shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                {hero.cta}
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </Link>
            <a href="#struktur" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl sm:rounded-[2rem] px-6 sm:px-10 py-5 sm:py-8 h-auto text-sm sm:text-lg font-bold border-white/10 text-white hover:border-blue-500/40 hover:bg-white/5 bg-transparent transition-all">
                STRUKTUR KAMI
              </Button>
            </a>
          </div>
          
          <div className="mt-10 md:mt-16 grid grid-cols-3 gap-3 xs:gap-4 md:gap-6 border-t border-white/5 pt-6 md:pt-10">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -6, scale: 1.03 }}
                className="min-w-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div className="text-xl xs:text-2xl md:text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 truncate group-hover:scale-105 transition-transform duration-300">{stat.value}</div>
                <div className="text-[8px] xs:text-[10px] sm:text-xs text-white/40 uppercase tracking-widest font-semibold mt-1 truncate group-hover:text-blue-300 transition-colors duration-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-md mx-auto lg:ml-auto group animate-float-slow"
        >
          {/* Decorative Backlighting */}
          <div className="absolute -inset-2 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-transparent blur-2xl group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Album Presentation Box / Collage Stack */}
          <div className="relative p-6 sm:p-8 glass rounded-[2.5rem] md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between h-[450px] sm:h-[500px]">
            {/* Absolute Abstract Art Lines */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Collage Mockup Stack Container */}
            <div className="relative flex-grow flex items-center justify-center my-4">
              {/* Stack 1 (Back left, rotates counter-clockwise) */}
              <div className="absolute w-[140px] h-[170px] bg-zinc-950/70 border border-white/10 rounded-2xl p-2 shadow-2xl -rotate-12 -translate-x-12 -translate-y-4 opacity-70 group-hover:opacity-90 group-hover:-translate-x-14 group-hover:-rotate-15 transition-all duration-500">
                <div className="w-full h-[110px] overflow-hidden rounded-xl bg-zinc-900 border border-white/5">
                  <img 
                    src={leftUrl} 
                    alt={leftTitle} 
                    className="w-full h-full object-cover grayscale contrast-125"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-2 text-[8px] uppercase tracking-widest text-white/40 font-bold text-center truncate px-1">{leftTitle}</div>
              </div>

              {/* Stack 2 (Back right, rotates clockwise) */}
              <div className="absolute w-[140px] h-[170px] bg-zinc-950/70 border border-white/10 rounded-2xl p-2 shadow-2xl rotate-12 translate-x-12 -translate-y-2 opacity-70 group-hover:opacity-90 group-hover:translate-x-14 group-hover:rotate-15 transition-all duration-500">
                <div className="w-full h-[110px] overflow-hidden rounded-xl bg-zinc-900 border border-white/5">
                  <img 
                    src={rightUrl} 
                    alt={rightTitle} 
                    className="w-full h-full object-cover grayscale contrast-125"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-2 text-[8px] uppercase tracking-widest text-white/40 font-bold text-center truncate px-1">{rightTitle}</div>
              </div>

              {/* Stack 3 (Foreground centered, fully upright and crisp) */}
              <div className="absolute w-[180px] h-[220px] bg-slate-900/90 border-2 border-white/15 rounded-3xl p-3 shadow-2xl group-hover:scale-105 group-hover:border-blue-500/30 transition-all duration-500 z-10">
                <div className="w-full h-[155px] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 relative">
                  <img 
                    src={centerUrl} 
                    alt={centerTitle} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-lg p-1 shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-widest text-blue-400 font-extrabold text-center flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span className="truncate max-w-[130px]">{centerTitle}</span>
                </div>
              </div>
            </div>

            {/* Label, Description & Dynamic Action Button */}
            <div className="text-center relative z-10 mt-2">
              <h3 className="font-display font-medium text-xs text-white/40 tracking-widest uppercase mb-2">
                Dokumentasi Kegiatan
              </h3>
              <p className="text-white/60 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                Jelajahi album foto petualangan, kemah bakti, api unggun, dan latihan rutin yang penuh dengan kenangan juang hebat.
              </p>

              <Link to="/dokumentasi" className="block w-full">
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl py-6 tracking-wider text-xs uppercase shadow-xl shadow-blue-500/20 border border-blue-400/20 gap-2.5 transition-all h-auto active:scale-[0.98] group/btn"
                >
                  <FolderHeart className="w-4 h-4 text-white group-hover/btn:scale-110 group-hover/btn:rotate-6 transition-transform" />
                  DOKUMENTASI KEGIATAN
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
