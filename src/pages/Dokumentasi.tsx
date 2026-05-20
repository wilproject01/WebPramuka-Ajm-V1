import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Sparkles,
  Camera,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface Activity {
  url: string;
  title: string;
  date?: string;
  desc?: string;
}

const DEFAULT_ACTIVITIES: Activity[] = [
  {
    url: "https://images.unsplash.com/photo-1526620536413-5de78833917d?q=80&w=1000&auto=format&fit=crop",
    title: "Latihan Gabungan Pramuka",
    date: "24 April 2026",
    desc: "Latihan bersama meningkatkan keterampilan kepramukaan dan sinergi antar pangkalan."
  },
  {
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop",
    title: "Perkemahan Sabtu Minggu (PERSAMI)",
    date: "08 Mei 2026",
    desc: "Membangun kemandirian, kedisiplinan, dan rasa persaudaraan melalui kehidupan alam terbuka."
  },
  {
    url: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=1000&auto=format&fit=crop",
    title: "Penjelajahan & Survival Alam",
    date: "12 Maret 2026",
    desc: "Uji fisik dan navigasi darat dalam penjelajahan pegunungan daerah Garut."
  },
  {
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop",
    title: "Pelantikan Penegak Bantara",
    date: "19 Februari 2026",
    desc: "Prosesi sakral pelantikan anggota ambalan baru yang berintegritas tinggi."
  },
  {
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
    title: "Kegiatan Bakti Sosial Komunitas",
    date: "05 Januari 2026",
    desc: "Pramuka hadir di tengah masyarakat membantu sirkulasi ketahanan pangan warga setempat."
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
    title: "Malam Keakraban Ambalan",
    date: "14 Desember 2025",
    desc: "Api unggun persaudaraan, refleksi juang, dan pentas seni kreativitas ambalan."
  }
];

export function Dokumentasi() {
  const [activities, setActivities] = useState<Activity[]>(DEFAULT_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [headerTitle, setHeaderTitle] = useState("Dokumentasi Kegiatan Ambalan");
  const [headerDesc, setHeaderDesc] = useState("Dokumentasi nyata jejak petualangan, pengabdian, latihan rutin, serta momen seru Ambalan Ir. H. Juanda & Laksamana Malahayati SMKN 2 Garut.");

  useEffect(() => {
    // Listen to direct content updates from Firestore
    const unsub = onSnapshot(doc(db, "content", "activities"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.headerTitle) {
          setHeaderTitle(data.headerTitle);
        }
        if (data.headerDesc) {
          setHeaderDesc(data.headerDesc);
        }
        if (Array.isArray(data.items)) {
          // Merge metadata fields if they exist, or supply default dates & descriptions dynamically
          const formatted = data.items.map((item: any, idx: number) => {
            const originalDefault = DEFAULT_ACTIVITIES[idx % DEFAULT_ACTIVITIES.length];
            return {
              url: item.url || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000&auto=format&fit=crop",
              title: item.title || `Kegiatan ${idx + 1}`,
              date: item.date || originalDefault?.date || "20 Momen Terbaik",
              desc: item.desc || originalDefault?.desc || "Momen kegiatan kepramukaan Ambalan AJM SMKN 2 Garut yang penuh nilai perjuangan."
            };
          });
          setActivities(formatted);
        }
      }
    });

    return () => unsub();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const title = activity.title || "";
    const desc = activity.desc || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           desc.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleNextPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredActivities.length);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (selectedPhotoIndex - 1 + filteredActivities.length) % filteredActivities.length
    );
  };

  // Close lightbox on keydown Escape and support slider navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex]);

  return (
    <div className="min-h-screen bg-pramuka-blue-dark text-white relative pt-28 pb-16 px-4 sm:px-6 md:px-8">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse-intense" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-[140px] pointer-events-none animate-float-slow" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation Button */}
        <div className="mb-6 sm:mb-8">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-white/10 text-white hover:bg-white/10 bg-transparent py-4 text-xs sm:text-sm font-semibold tracking-wide"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        {/* Dynamic Header */}
        <div className="text-center md:text-left mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 border border-blue-500/20 shadow-md">
              <Camera className="w-3.5 h-3.5" />
              GALERI DOKUMENTASI
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-300 animate-shimmer-bg bg-size-200 tracking-tighter">
              {headerTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/50 leading-relaxed font-medium">
              {headerDesc}
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Cari dokumentasi kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 hover:border-blue-500/30 focus:border-blue-500/50 outline-none rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-white/30 text-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Empty Search State */}
        {filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl p-8"
          >
            <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4 animate-bounce" />
            <p className="text-lg font-bold text-white mb-2">Dokumentasi Tidak Ditemukan</p>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              Tidak ada dokumentasi kegiatan dengan kata kunci "{searchQuery}". Coba masukkan kata kunci yang berbeda.
            </p>
          </motion.div>
        )}

        {/* Photos Album Grid Box */}
        {filteredActivities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="group bg-white/[0.02] border border-white/5 hover:border-blue-500/30 rounded-3xl p-3 sm:p-4 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer transition-all duration-300 flex flex-col h-full"
                >
                  {/* Photo Frame Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/5">
                    <img
                      src={activity.url}
                      alt={activity.title}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Hover Play Button Glow Backlighting */}
                    <div className="absolute inset-0 bg-pramuka-blue-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg animate-pulse scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Date Badge overlay */}
                    {activity.date && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold text-amber-400 border border-white/10 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {activity.date}
                      </div>
                    )}
                  </div>

                  {/* Photo Details (Aesthetic Polaroid Layout) */}
                  <div className="pt-4 pb-1 pl-1 flex flex-col flex-grow">
                    <h3 className="font-display font-bold text-base text-white tracking-tight leading-tight mb-2 group-hover:text-blue-300 transition-colors truncate">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-white/40 font-medium leading-relaxed line-clamp-2 mt-auto">
                      {activity.desc}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Detail Album</span>
                      <span>→</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox / Enlarged Photo Carousel Overlay with backdrop-blur */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhotoIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none"
          >
            {/* Lightbox Header Controls */}
            <div className="flex items-center justify-between text-white/60 w-full relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-mono tracking-widest bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                  PHOTO {selectedPhotoIndex + 1} OF {filteredActivities.length}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhotoIndex(null);
                }}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Principal Picture Body Carousel */}
            <div className="flex-grow w-full max-w-5xl mx-auto flex items-center justify-between gap-4 py-4 relative">
              {/* Left Carousel Navigation Trigger */}
              <button
                onClick={handlePrevPhoto}
                className="hidden sm:flex w-12 h-12 rounded-full bg-white/5 hover:bg-blue-600/90 border border-white/10 items-center justify-center text-white transition-all cursor-pointer shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Main Active Picture */}
              <div className="flex-grow flex items-center justify-center h-[50vh] sm:h-[60vh] md:h-[65vh] relative max-w-[90%] mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedPhotoIndex}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full flex items-center justify-center pointer-events-none"
                  >
                    <img
                      src={filteredActivities[selectedPhotoIndex].url}
                      alt={filteredActivities[selectedPhotoIndex].title}
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Carousel Navigation Trigger */}
              <button
                onClick={handleNextPhoto}
                className="hidden sm:flex w-12 h-12 rounded-full bg-white/5 hover:bg-blue-600/90 border border-white/10 items-center justify-center text-white transition-all cursor-pointer shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>

            {/* Carousel Polaroid Description Card (Footer) */}
            <div className="w-full max-w-3xl mx-auto bg-white/[0.03] border border-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center shadow-2xl relative z-10 transition-all duration-300">
              <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Ambalan Ir. H. Juanda - Laksamana Malahayati
              </div>
              <h2 className="font-display font-bold text-base sm:text-xl text-white tracking-tight mb-2 sm:mb-3">
                {filteredActivities[selectedPhotoIndex].title}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
                {filteredActivities[selectedPhotoIndex].desc}
              </p>
              
              {/* Mobile Swipe / Tap Assistant Indicators */}
              <div className="flex sm:hidden items-center justify-between gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  onClick={handlePrevPhoto}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase text-white/80 active:bg-blue-600"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </button>
                <span className="text-[10px] font-mono text-white/30">
                  {selectedPhotoIndex + 1} / {filteredActivities.length}
                </span>
                <button
                  onClick={handleNextPhoto}
                  className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase text-white/80 active:bg-blue-600"
                >
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
