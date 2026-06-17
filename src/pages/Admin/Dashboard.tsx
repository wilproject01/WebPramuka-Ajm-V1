import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/App";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  LayoutDashboard,
  Trees as Tree,
  Plus,
  Edit,
  Save,
  Image as ImageIcon,
  RotateCcw,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface StructureMember {
  id?: string;
  name: string;
  role: string;
  photoUrl: string;
  divisionId: string;
  order: number;
}

interface StructureDivision {
  id: string;
  name: string;
  icon: string;
  order: number;
}

interface Registration {
  id: string;
  fullName: string;
  jurusan: string;
  phone: string;
  status: string;
  createdAt: any;
}

interface Member {
  id: string;
  name: string;
  role: 'Pembina' | 'Dewan Ambalan' | 'Cada' | 'Caba';
  jurusan: string;
  phone: string;
  createdAt: any;
}

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        if (img.width > MAX_WIDTH) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const DEFAULT_ACTIVITIES = [
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

export function AdminDashboard() {
  const { logout } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Structure Management State
  const [structureDivisions, setStructureDivisions] = useState<StructureDivision[]>([]);
  const [structureMembers, setStructureMembers] = useState<StructureMember[]>([]);
  const [editingMember, setEditingMember] = useState<StructureMember | null>(null);
  const [isEditStructureOpen, setIsEditStructureOpen] = useState(false);
  const [isAddStructureMemberOpen, setIsAddStructureMemberOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'member' | 'registration' | 'structure' } | null>(null);
  const [appsScriptUrl, setAppsScriptUrl] = useState("");
  const [heroContent, setHeroContent] = useState({
    title: "GERAKAN PRAMUKA GUGUS DEPAN 02.095 - 02.096",
    subtitle: "Ambalan Ir. H. Juanda - Laksamana Malahayati || Wadahnya para anak kreatif untuk mengasah keterampilan, kedisiplinan, dan jiwa kepemimpinan di era modern.",
    cta: "JOIN SEKARANG"
  });
  const [stats, setStats] = useState([
    { label: "Dewan Ambalan", value: "0" },
    { label: "Calon Dewan", value: "0" },
    { label: "Calon Bantara", value: "0" }
  ]);
  const [footerCta, setFooterCta] = useState({
    title: "Siap Menjadi Pemimpin Masa Depan?",
    subtitle: "Mari asah kemampuanmu dan jalin persaudaraan di Gerakan Pramuka Ajm Smkn2Garut.",
    buttonText: "Daftar Sekarang"
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [activities, setWebActivities] = useState<{url: string, title: string, date?: string, desc?: string}[]>(DEFAULT_ACTIVITIES);
  const [dokumentasiHeader, setDokumentasiHeader] = useState({
    title: "Dokumentasi Kegiatan Ambalan",
    desc: "Dokumentasi nyata jejak petualangan, pengabdian, latihan rutin, serta momen seru Ambalan Ir. H. Juanda & Laksamana Malahayati SMKN 2 Garut."
  });
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [newStructureMember, setNewStructureMember] = useState<StructureMember>({
    name: "",
    role: "",
    photoUrl: "",
    divisionId: "",
    order: 0
  });

  // Manual Add Member State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    jurusan: "",
    phone: "",
    role: "Cada" as Member['role'],
  });

  useEffect(() => {
    // Registrations listener
    const regQ = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    const unsubReg = onSnapshot(regQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Registration[];
      setRegistrations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "registrations");
    });

    // Members listener
    const memQ = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const unsubMem = onSnapshot(memQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Member[];
      setMembers(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "members");
    });

    return () => {
      unsubReg();
      unsubMem();
    };
  }, []);

  useEffect(() => {
    const unsubBrand = onSnapshot(doc(db, "content", "brand"), (snapshot) => {
      if (snapshot.exists()) {
        setLogoUrl(snapshot.data().logoUrl || "");
      }
    });

    const qSettings = doc(db, "settings", "google_sheets");
    const unsubSettings = onSnapshot(qSettings, (doc) => {
      if (doc.exists()) {
        setAppsScriptUrl(doc.data().value || "");
      }
    }, (error) => {
      console.error("Snap error settings:", error);
      handleFirestoreError(error, OperationType.GET, "settings/google_sheets");
    });

    const unsubActivities = onSnapshot(doc(db, "content", "activities"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          setWebActivities(data.items);
        }
        setDokumentasiHeader({
          title: data.headerTitle || "Dokumentasi Kegiatan Ambalan",
          desc: data.headerDesc || "Dokumentasi nyata jejak petualangan, pengabdian, latihan rutin, serta momen seru Ambalan Ir. H. Juanda & Laksamana Malahayati SMKN 2 Garut."
        });
      }
    }, (error) => {
      console.error("Snap error activities mount listener:", error);
      handleFirestoreError(error, OperationType.GET, "content/activities");
    });

    // Run silent automatic migration for division names
    const runDivisionsMigration = async () => {
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

        // Delete "Digital & IT" division
        await deleteDoc(doc(db, "structure_divisions", "it"));
      } catch (err) {
        console.error("Silent background divisions migration error:", err);
      }
    };
    runDivisionsMigration();

    return () => {
      unsubBrand();
      unsubSettings();
      unsubActivities();
    };
  }, []);

  useEffect(() => {
    if (activeTab === "struktur" || activeTab === "konten") {
      const qDiv = query(collection(db, "structure_divisions"), orderBy("order", "asc"));
      const unsubDiv = onSnapshot(qDiv, (snapshot) => {
        setStructureDivisions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StructureDivision[]);
      }, (error) => {
        console.error("Snap error divisions:", error);
        handleFirestoreError(error, OperationType.LIST, "structure_divisions");
      });

      const qMem = query(collection(db, "structure_members"), orderBy("order", "asc"));
      const unsubMemStruc = onSnapshot(qMem, (snapshot) => {
        setStructureMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StructureMember[]);
      }, (error) => {
        console.error("Snap error members:", error);
        handleFirestoreError(error, OperationType.LIST, "structure_members");
      });

      // Web Content Listeners
      const unsubHero = onSnapshot(doc(db, "content", "hero"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setHeroContent(prev => ({
            title: data.title || prev.title,
            subtitle: data.subtitle || prev.subtitle,
            cta: data.cta || prev.cta
          }));
        }
      });

      const unsubStats = onSnapshot(doc(db, "content", "stats"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            setStats(data.items);
          }
        }
      });

      const unsubFooter = onSnapshot(doc(db, "content", "footer"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setFooterCta(prev => ({
            title: data.title || prev.title,
            subtitle: data.subtitle || prev.subtitle,
            buttonText: data.buttonText || prev.buttonText
          }));
        }
      });

      return () => {
        unsubDiv();
        unsubMemStruc();
        unsubHero();
        unsubStats();
        unsubFooter();
      };
    }
  }, [activeTab]);

  useEffect(() => {
    if (structureMembers && structureMembers.length >= 0) {
      const dewanCount = structureMembers.filter(m => m.divisionId === "inti").length;
      const cadaCount = structureMembers.filter(m => m.divisionId === "tekpram").length;
      const cabaCount = structureMembers.filter(m => m.divisionId === "humas").length;

      setStats([
        { label: "Dewan Ambalan", value: `${dewanCount}` },
        { label: "Calon Dewan", value: `${cadaCount}` },
        { label: "Calon Bantara", value: `${cabaCount}` }
      ]);
    }
  }, [structureMembers]);

  const handleSaveHero = async () => {
    setIsSavingContent(true);
    try {
      await setDoc(doc(db, "content", "hero"), {
        ...heroContent,
        updatedAt: serverTimestamp()
      });
      toast.success("Konten Hero berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan Hero.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveActivities = async () => {
    setIsSavingContent(true);
    try {
      await setDoc(doc(db, "content", "activities"), {
        items: activities,
        headerTitle: dokumentasiHeader.title,
        headerDesc: dokumentasiHeader.desc,
        updatedAt: serverTimestamp()
      });
      toast.success("Konten Kegiatan & Dokumentasi berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan Kegiatan.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveStats = async () => {
    setIsSavingContent(true);
    try {
      await setDoc(doc(db, "content", "stats"), {
        items: stats,
        updatedAt: serverTimestamp()
      });
      toast.success("Konten Statistik berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan Statistik.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveFooter = async () => {
    setIsSavingContent(true);
    try {
      await setDoc(doc(db, "content", "footer"), {
        ...footerCta,
        updatedAt: serverTimestamp()
      });
      toast.success("Konten Footer CTA berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan Footer CTA.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleSaveBrand = async () => {
    setIsSavingContent(true);
    try {
      await setDoc(doc(db, "content", "brand"), {
        logoUrl,
        updatedAt: serverTimestamp()
      });
      toast.success("Logo organisasi berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan Logo.");
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleAddActivity = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    setWebActivities([...activities, { url: "", title: "Kegiatan Baru", date: formattedDate, desc: "" }]);
  };

  const handleRemoveActivity = (index: number) => {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setWebActivities(newActivities);
  };

  const handleUpdateActivity = (index: number, field: 'url' | 'title' | 'date' | 'desc', val: string) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: val };
    setWebActivities(newActivities);
  };

  const handleAddStructureMember = async () => {
    if (!newStructureMember.name || !newStructureMember.divisionId) {
      toast.error("Nama dan divisi wajib diisi.");
      return;
    }
    await syncToStructure(newStructureMember.name, newStructureMember.role, newStructureMember.photoUrl, newStructureMember.divisionId);
    setIsAddStructureMemberOpen(false);
    setNewStructureMember({ name: "", role: "", photoUrl: "", divisionId: "", order: 0 });
  };

  const syncToStructure = async (name: string, role: string, photoUrl: string, divisionId: string) => {
    try {
      // Ensure division exists (at least "inti" for Dewan Ambalan)
      if (divisionId === "inti") {
        const divRef = doc(db, "structure_divisions", "inti");
        await setDoc(divRef, { 
          name: "Dewan Ambalan", 
          icon: "Landmark", 
          order: 1 
        }, { merge: true });
      }

      // Check if already exists to prevent duplicates
      // We look at the latest structureMembers in the closure or fetch if needed
      // but usually the snapshot listener keeps structureMembers updated.
      const exists = structureMembers.find(m => m.name === name && m.divisionId === divisionId);
      if (exists) {
        console.log("Member already in structure:", name);
        return;
      }

      await addDoc(collection(db, "structure_members"), {
        name,
        role,
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        divisionId,
        order: structureMembers.filter(m => m.divisionId === divisionId).length + 1
      });
      toast.success(`Berhasil sinkronisasi ${name} ke struktur.`);
    } catch (e) {
      console.error("Sync error:", e);
      toast.error("Gagal sinkronisasi ke struktur.");
    }
  };

  const handleDeleteStructureMember = async (id: string) => {
    const toastId = toast.loading("Menghapus anggota struktur...");
    try {
      await deleteDoc(doc(db, "structure_members", id));
      toast.success("Anggota struktur dihapus.", { id: toastId });
    } catch (e: any) {
      toast.error("Gagal menghapus anggota.", { id: toastId });
      handleFirestoreError(e, OperationType.DELETE, `structure_members/${id}`);
    }
  };

  const handleSeedStructure = async () => {
    setIsSeeding(true);
    const toastId = toast.loading("Menginisialisasi struktur organisasi...");
    
    try {
      const divisionsInitial = [
        { name: "Dewan Ambalan", icon: "Landmark", order: 1 },
        { name: "Calon Dewan Ambalan", icon: "Hammer", order: 2 },
        { name: "Calon Bantara", icon: "User", order: 3 }
      ];

      const divIds = ["inti", "tekpram", "humas"];

      // First ensure divisions are created
      for (let i = 0; i < divisionsInitial.length; i++) {
        await setDoc(doc(db, "structure_divisions", divIds[i]), divisionsInitial[i]);
      }

      // Delete IT division if exists
      await deleteDoc(doc(db, "structure_divisions", "it"));

      // Default members
      const membersInitial = [
        { name: "Andhika Pratama", role: "Pradana Putra", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andhika", divisionId: "inti", order: 1 },
        { name: "Siti Rahma", role: "Pradana Putri", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti", divisionId: "inti", order: 2 },
        { name: "Rizky Ramadhani", role: "Sekretaris I", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizky", divisionId: "inti", order: 3 },
        { name: "Siti Aminah", role: "Bendahara I", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aminah", divisionId: "inti", order: 4 },
        { name: "Ahmad Zaki", role: "Kordinator", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki", divisionId: "tekpram", order: 1 },
      ];

      for (const mem of membersInitial) {
        await addDoc(collection(db, "structure_members"), mem);
      }

      // Check and sync existing members with structured roles to prevent duplicate insertions
      for (const m of members) {
        if (!membersInitial.some(mi => mi.name === m.name)) {
          let roleName = "";
          let divId = "";
          if (m.role === "Dewan Ambalan") {
            roleName = "Dewan Ambalan";
            divId = "inti";
          } else if (m.role === "Cada") {
            roleName = "Cada";
            divId = "tekpram";
          } else if (m.role === "Caba") {
            roleName = "Caba";
            divId = "humas";
          }

          if (divId) {
            await addDoc(collection(db, "structure_members"), {
              name: m.name,
              role: roleName,
              photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
              divisionId: divId,
              order: 10 + Math.random() // Put them later
            });
          }
        }
      }
      
      toast.success("Struktur berhasil diinisialisasi.", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Gagal inisialisasi struktur: " + (e instanceof Error ? e.message : "Unknown error"), { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  const syncDewanAmbalan = async () => {
    const toastId = toast.loading("Sinkronisasi anggota ke struktur...");
    try {
      let count = 0;
      
      // 1. Sync Dewan Ambalan -> inti
      const dewanMembers = members.filter(m => m.role === "Dewan Ambalan");
      for (const m of dewanMembers) {
        const exists = structureMembers.find(sm => sm.name === m.name);
        if (!exists) {
          await addDoc(collection(db, "structure_members"), {
            name: m.name,
            role: "Dewan Ambalan",
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
            divisionId: "inti",
            order: structureMembers.filter(sm => sm.divisionId === "inti").length + 1
          });
          count++;
        } else if (exists.divisionId !== "inti" || exists.role !== "Dewan Ambalan") {
          await updateDoc(doc(db, "structure_members", exists.id), {
            divisionId: "inti",
            role: "Dewan Ambalan"
          });
          count++;
        }
      }

      // 2. Sync Cada -> tekpram
      const cadaMembers = members.filter(m => m.role === "Cada");
      for (const m of cadaMembers) {
        const exists = structureMembers.find(sm => sm.name === m.name);
        if (!exists) {
          await addDoc(collection(db, "structure_members"), {
            name: m.name,
            role: "Cada",
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
            divisionId: "tekpram",
            order: structureMembers.filter(sm => sm.divisionId === "tekpram").length + 1
          });
          count++;
        } else if (exists.divisionId !== "tekpram" || exists.role !== "Cada") {
          await updateDoc(doc(db, "structure_members", exists.id), {
            divisionId: "tekpram",
            role: "Cada"
          });
          count++;
        }
      }

      // 3. Sync Caba -> humas
      const cabaMembers = members.filter(m => m.role === "Caba");
      for (const m of cabaMembers) {
        const exists = structureMembers.find(sm => sm.name === m.name);
        if (!exists) {
          await addDoc(collection(db, "structure_members"), {
            name: m.name,
            role: "Caba",
            photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name)}`,
            divisionId: "humas",
            order: structureMembers.filter(sm => sm.divisionId === "humas").length + 1
          });
          count++;
        } else if (exists.divisionId !== "humas" || exists.role !== "Caba") {
          await updateDoc(doc(db, "structure_members", exists.id), {
            divisionId: "humas",
            role: "Caba"
          });
          count++;
        }
      }

      toast.success(`${count} anggota disinkronkan atau diperbarui di struktur.`, { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Gagal sinkronisasi.", { id: toastId });
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: Member['role']) => {
    try {
      await updateDoc(doc(db, "members", memberId), { role: newRole });
      
      const m = members.find(mem => mem.id === memberId);
      if (m) {
        if (newRole === "Dewan Ambalan") {
          await syncToStructure(m.name, "Dewan Ambalan", "", "inti");
        } else if (newRole === "Cada") {
          await syncToStructure(m.name, "Cada", "", "tekpram");
        } else if (newRole === "Caba") {
          await syncToStructure(m.name, "Caba", "", "humas");
        }
      }
      
      toast.success("Role anggota diperbarui.");
    } catch (e) {
      toast.error("Gagal memperbarui role.");
    }
  };

  const handleUpdateStructureMember = async () => {
    if (!editingMember || !editingMember.id) return;
    try {
      const { id, ...data } = editingMember;
      await updateDoc(doc(db, "structure_members", id), data);
      toast.success("Data anggota struktur diperbarui.");
      setIsEditStructureOpen(false);
      setEditingMember(null);
    } catch (e) {
      toast.error("Gagal memperbarui data.");
    }
  };

  const handleSaveWebhook = async () => {
    try {
      await setDoc(doc(db, "settings", "google_sheets"), {
        key: "webhook_url",
        value: appsScriptUrl,
        updatedAt: serverTimestamp()
      });
      toast.success("URL Webhook berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan URL.");
    }
  };

  const sendToWebhook = async (data: any, isTest = false) => {
    if (!appsScriptUrl) {
      if (isTest) toast.error("URL Webhook belum diatur.");
      return false;
    }
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (isTest) toast.success("Uji koneksi terkirim! Periksa Google Sheets Anda.");
      return true;
    } catch (e) {
      console.error("Webhook error:", e);
      if (isTest) toast.error("Gagal mengirim data ke webhook.");
      return false;
    }
  };

  const handleTestWebhook = () => {
    sendToWebhook({
      action: "test_connection",
      data: {
        message: "Koneksi berhasil terhubung dari Dashboard Admin",
        timestamp: new Date().toISOString(),
        admin: "wildenbusiness"
      }
    }, true);
  };

  const handleApproveRegistration = async (reg: Registration) => {
    try {
      // 1. Update registration status
      await updateDoc(doc(db, "registrations", reg.id), { status: "approved" });
      
      const defaultRole = "Caba" as Member['role'];

      // 2. Add as member
      await addDoc(collection(db, "members"), {
        name: reg.fullName,
        jurusan: reg.jurusan,
        phone: reg.phone,
        role: defaultRole,
        createdAt: serverTimestamp(),
      });

      // 3. Auto sync based on role
      if (defaultRole === "Dewan Ambalan") {
        await syncToStructure(reg.fullName, "Dewan Ambalan", "", "inti");
      } else if (defaultRole === "Cada") {
        await syncToStructure(reg.fullName, "Cada", "", "tekpram");
      } else if (defaultRole === "Caba") {
        await syncToStructure(reg.fullName, "Caba", "", "humas");
      }

      // 4. Sync to Google Sheets
      await sendToWebhook({
        action: "approve_registration",
        data: {
          name: reg.fullName,
          jurusan: reg.jurusan,
          phone: reg.phone,
          approvedAt: new Date().toISOString()
        }
      });
      
      toast.success(`${reg.fullName} telah disetujui dan ditambahkan sebagai anggota.`);
    } catch (e) {
      toast.error("Gagal melakukan verifikasi pendaftaran.");
    }
  };

  const handleManualAddMember = async () => {
    if (!newMember.name) {
      toast.error("Nama wajib diisi.");
      return;
    }

    try {
      await addDoc(collection(db, "members"), {
        ...newMember,
        createdAt: serverTimestamp(),
      });

      // Auto sync based on role
      if (newMember.role === "Dewan Ambalan") {
        await syncToStructure(newMember.name, "Dewan Ambalan", "", "inti");
      } else if (newMember.role === "Cada") {
        await syncToStructure(newMember.name, "Cada", "", "tekpram");
      } else if (newMember.role === "Caba") {
        await syncToStructure(newMember.name, "Caba", "", "humas");
      }

      // Sync to Google Sheets
      await sendToWebhook({
        action: "add_member_manual",
        data: {
          ...newMember,
          addedAt: new Date().toISOString()
        }
      });

      toast.success("Anggota berhasil ditambahkan.");
      setIsAddMemberOpen(false);
      setNewMember({ name: "", jurusan: "", phone: "", role: "Cada" });
    } catch (e) {
      console.error(e);
      toast.error("Gagal menambahkan anggota. Pastikan koneksi dan database tersedia.");
    }
  };

  const handleDeleteMember = async (id: string) => {
    const toastId = toast.loading("Menghapus anggota...");
    try {
      await deleteDoc(doc(db, "members", id));
      toast.success("Anggota berhasil dihapus.", { id: toastId });
    } catch (e: any) {
      toast.error("Gagal menghapus anggota.", { id: toastId });
      handleFirestoreError(e, OperationType.DELETE, `members/${id}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "registrations", id), { status });
      toast.success(`Status pendaftaran berhasil diubah ke ${status}`);
    } catch (e) {
      toast.error("Gagal mengubah status.");
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    const toastId = toast.loading("Menghapus data...");
    try {
      await deleteDoc(doc(db, "registrations", id));
      toast.success("Berhasil menghapus pendaftaran.", { id: toastId });
    } catch (e: any) {
      toast.error("Gagal menghapus.", { id: toastId });
      handleFirestoreError(e, OperationType.DELETE, `registrations/${id}`);
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsConfirmOpen(false);
    
    if (itemToDelete.type === 'member') {
      await handleDeleteMember(itemToDelete.id);
    } else if (itemToDelete.type === 'registration') {
      await handleDeleteRegistration(itemToDelete.id);
    } else if (itemToDelete.type === 'structure') {
      await handleDeleteStructureMember(itemToDelete.id);
    }
    
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans flex flex-col md:flex-row text-white overflow-x-hidden p-4 md:p-6 gap-4 md:gap-6 relative">
      {/* Background Orbs */}
      <div className="glow-orb top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20" />
      <div className="glow-orb bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10" />

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden p-0.5">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Tree className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="font-bold text-base tracking-tight uppercase">PRAMUKA <span className="text-blue-400">AJM</span></span>
        </div>
        <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          <Menu className="w-6 h-6" />
        </Button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-[60] w-64
        md:flex flex-col gap-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 transition-all duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        md:h-[calc(100vh-3rem)]
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden p-1">
               {logoUrl ? (
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <Tree className="w-6 h-6 text-white" />
               )}
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">PRAMUKA <span className="text-blue-400">AJM</span></span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-white/40" onClick={() => setIsMobileMenuOpen(false)}>
            <XCircle className="w-6 h-6" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "anggota", icon: Users, label: "Anggota" },
            { id: "konten", icon: Settings, label: "Konten Web" },
            { id: "struktur", icon: Tree, label: "Struktur" },
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`px-5 py-4 rounded-[1.5rem] flex items-center gap-3 font-bold text-sm tracking-widest uppercase cursor-pointer transition-all ${
                activeTab === item.id ? "bg-white/10 text-blue-400" : "text-white/50 hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="p-5 bg-blue-900/40 rounded-[2rem] border border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-2">Admin Active</p>
            <div className="flex items-center gap-3 mb-4">
               <Avatar className="w-8 h-8 rounded-lg">
                 <AvatarFallback className="bg-blue-600 text-white rounded-lg text-xs">AD</AvatarFallback>
               </Avatar>
               <div className="text-xs font-bold text-white/80">wildenbusiness</div>
            </div>
            <Button 
               variant="ghost" 
               onClick={logout}
               className="w-full justify-start gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl p-0 h-auto font-bold text-xs uppercase tracking-widest"
             >
               <LogOut className="w-4 h-4" /> Keluar
             </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 md:gap-8 relative z-10 w-full overflow-x-hidden md:overflow-y-auto no-scrollbar">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter">Dashboard Admin</h1>
            <p className="text-white/40 text-sm md:font-medium">Pusat Pengelolaan Organisasi Pramuka Inti</p>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest">
                Web Utama
              </button>
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="glass-card p-6 md:p-8">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Total Anggota</p>
            <p className="text-3xl md:text-4xl font-bold text-white">{members.length}</p>
            <div className="mt-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest">AKTIF</div>
          </div>
          <div className="glass-card p-6 md:p-8">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Pendaftar Baru</p>
            <p className="text-3xl md:text-4xl font-bold text-white">{registrations.filter(r => r.status === 'pending').length}</p>
            <div className="mt-3 text-[10px] font-bold text-amber-500 uppercase tracking-widest">PERLU VERIFIKASI</div>
          </div>
          <div className="glass-card p-6 md:p-8">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-2">Total Media</p>
            <p className="text-3xl md:text-4xl font-bold text-white">{activities.length}</p>
            <div className="mt-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">FOTO & VIDEO</div>
          </div>
        </section>

        {/* Main Sections */}
        <div className="flex-1 min-h-0">
          {activeTab === "dashboard" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-10 flex flex-col h-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Antrian Pendaftaran Terbaru</h2>
                <div className="flex gap-3">
                   <Badge className="bg-blue-600 text-white rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-widest">Live Updates</Badge>
                </div>
              </div>
              
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <div className="min-w-[600px]">
                  <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Calon Anggota</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Jurusan / Kelas</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Kontak</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Status</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id} className="border-white/5">
                        <TableCell className="py-4 md:py-6">
                          <div className="flex items-center gap-3 md:gap-4">
                             <Avatar className="w-7 h-7 md:w-8 md:h-8 rounded-xl border border-white/10">
                               <AvatarFallback className="bg-blue-600/20 text-blue-400 rounded-xl font-bold text-[9px] md:text-[10px]">
                                 {reg.fullName.charAt(0)}
                               </AvatarFallback>
                             </Avatar>
                             <div className="font-bold text-white">{reg.fullName}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 text-white/60 font-medium text-sm">{reg.jurusan}</TableCell>
                        <TableCell className="py-6 text-white/40 font-medium text-xs">{reg.phone}</TableCell>
                        <TableCell className="py-6">
                          <Badge className={`rounded-xl px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest border ${
                            reg.status === 'approved' 
                              ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                              : reg.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 text-right">
                          <div className="flex justify-end gap-2">
                             {reg.status !== 'approved' && (
                               <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 onClick={() => handleApproveRegistration(reg)}
                                 className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20"
                                 title="Approve & Add Member"
                               >
                                 <CheckCircle className="w-5 h-5" />
                               </Button>
                             )}
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               onClick={() => {
                                 setItemToDelete({ id: reg.id, type: 'registration' });
                                 setIsConfirmOpen(true);
                               }}
                               className="w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white text-white/40 rounded-xl transition-all"
                             >
                               <Trash2 className="w-5 h-5" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {registrations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-20 text-center text-white/20 font-bold uppercase tracking-widest text-sm">
                          Belum ada antrian pendaftaran.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "anggota" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-white/5 rounded-[3rem] p-10 flex flex-col h-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Manajemen Anggota</h2>
                  <p className="text-white/40 text-xs md:text-sm mt-1">Daftar anggota aktif organisasi.</p>
                </div>
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger render={<Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-[1.5rem] px-5 md:px-8 py-3.5 md:py-6 h-auto font-bold uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-blue-500/20" />}>
                    <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tambah Anggota
                  </DialogTrigger>
                  <DialogContent className="glass-card border-white/10 text-white sm:max-w-[500px] p-6 md:p-10">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Tambah Anggota Manual</DialogTitle>
                      <DialogDescription className="text-white/50">
                        Masukkan data anggota baru di sini. Klik simpan setelah selesai.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Nama Lengkap</Label>
                        <Input 
                          value={newMember.name} 
                          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                          className="bg-white/5 border-white/10 h-12 rounded-xl" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Jurusan / Kelas</Label>
                          <Input 
                            value={newMember.jurusan} 
                            onChange={(e) => setNewMember({...newMember, jurusan: e.target.value})}
                            className="bg-white/5 border-white/10 h-12 rounded-xl" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-white/40">WhatsApp</Label>
                          <Input 
                            value={newMember.phone} 
                            onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                            className="bg-white/5 border-white/10 h-12 rounded-xl" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Role / Jabatan</Label>
                          <Select 
                            value={newMember.role} 
                            onValueChange={(val: Member['role']) => setNewMember({...newMember, role: val})}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                              <SelectValue placeholder="Pilih Role" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10 text-white">
                              <SelectItem value="Pembina">Pembina</SelectItem>
                              <SelectItem value="Dewan Ambalan">Dewan Ambalan</SelectItem>
                              <SelectItem value="Cada">Cada</SelectItem>
                              <SelectItem value="Caba">Caba</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsAddMemberOpen(false)}
                        className="rounded-xl"
                      >
                        Batal
                      </Button>
                      <Button 
                        onClick={handleManualAddMember}
                        className="bg-blue-600 hover:bg-blue-500 rounded-xl px-8"
                      >
                        Simpan Anggota
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <div className="min-w-[700px]">
                  <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Nama Anggota</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Jurusan / Kelas</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">WA</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6">Role</TableHead>
                      <TableHead className="text-white/30 font-bold text-[10px] uppercase tracking-[0.2em] pb-4 md:pb-6 text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="border-white/5">
                        <TableCell className="py-4 md:py-6">
                           <div className="flex items-center gap-3">
                             <Avatar className="w-7 h-7 md:w-8 md:h-8 rounded-xl border border-white/10">
                               <AvatarFallback className="bg-blue-600 text-white rounded-xl font-bold text-[9px] md:text-[10px]">
                                 {member.name.charAt(0)}
                               </AvatarFallback>
                             </Avatar>
                             <div className="font-bold text-white">{member.name}</div>
                           </div>
                        </TableCell>
                        <TableCell className="py-6 text-white/60 font-medium text-sm">{member.jurusan}</TableCell>
                        <TableCell className="py-6 text-white/40 font-medium text-xs">{member.phone}</TableCell>
                         <TableCell className="py-6">
                            <Select 
                              value={member.role} 
                              onValueChange={(val: Member['role']) => handleUpdateMemberRole(member.id, val)}
                            >
                              <SelectTrigger className={`h-8 rounded-lg border px-3 text-[10px] font-bold uppercase tracking-widest ${
                                member.role === 'Pembina' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                member.role === 'Dewan Ambalan' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-blue-600/10 text-blue-400 border-blue-500/20'
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-card border-white/10 text-white">
                                <SelectItem value="Pembina">Pembina</SelectItem>
                                <SelectItem value="Dewan Ambalan">Dewan Ambalan</SelectItem>
                                <SelectItem value="Cada">Cada</SelectItem>
                                <SelectItem value="Caba">Caba</SelectItem>
                              </SelectContent>
                            </Select>
                         </TableCell>
                        <TableCell className="py-6 text-right">
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             onClick={() => {
                               setItemToDelete({ id: member.id, type: 'member' });
                               setIsConfirmOpen(true);
                             }}
                             className="w-10 h-10 bg-white/5 hover:bg-red-500 hover:text-white text-white/40 rounded-xl transition-all"
                           >
                             <Trash2 className="w-5 h-5" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {members.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-20 text-center text-white/20 font-bold uppercase tracking-widest text-sm">
                          Belum ada anggota terdaftar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "struktur" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-10 flex flex-col h-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Pengaturan Struktur Organisasi</h2>
                  <p className="text-white/40 text-xs md:text-sm mt-1">Sesuaikan nama, jabatan, dan foto kepengurusan.</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {structureDivisions.length > 0 && (
                    <Button variant="outline" onClick={syncDewanAmbalan} className="flex-1 sm:flex-none rounded-xl gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-auto py-2.5 px-4 sm:px-6 font-bold text-[10px] uppercase tracking-widest">
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" /> Sync Role
                    </Button>
                  )}
                  {structureDivisions.length === 0 && (
                     <Button 
                        variant="outline" 
                        onClick={handleSeedStructure} 
                        disabled={isSeeding}
                        className="w-full sm:w-auto rounded-xl gap-2 bg-blue-600 border-none text-white hover:bg-blue-500 shadow-lg shadow-blue-500/30 font-bold h-auto py-3 px-8 text-xs uppercase tracking-widest"
                      >
                       <RotateCcw className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} /> 
                       {isSeeding ? 'Proses...' : 'Inisialisasi Data'}
                     </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-12 pr-0 md:pr-4">
                {structureDivisions.length > 0 ? (
                  structureDivisions.map((division) => (
                    <div key={division.id} className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                        <div className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
                           <Tree className="w-4 h-4" />
                        </div>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-white/80">{division.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {structureMembers.filter(m => m.divisionId === division.id).map((member) => (
                          <div key={member.id} className="glass-card p-4 md:p-6 flex flex-col gap-3 md:gap-4 group transition-all hover:border-blue-500/30">
                            <div className="flex items-center gap-3">
                               <Avatar className="w-8 h-8 md:w-9 md:h-9 rounded-xl">
                                 <AvatarImage src={member.photoUrl} className="object-cover" />
                                 <AvatarFallback className="bg-white/5 text-white/20">
                                   <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                                 </AvatarFallback>
                               </Avatar>
                               <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-white truncate">{member.name}</h4>
                                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate">{member.role}</p>
                               </div>
                               <div className="flex gap-2">
                                 <Button 
                                   size="icon" 
                                   variant="ghost" 
                                   onClick={() => {
                                     setEditingMember(member);
                                     setIsEditStructureOpen(true);
                                   }}
                                   className="bg-white/10 rounded-xl hover:bg-blue-600 hover:text-white"
                                 >
                                   <Edit className="w-4 h-4" />
                                 </Button>
                                 <Button 
                                   size="icon" 
                                   variant="ghost" 
                                   onClick={() => {
                                     setItemToDelete({ id: member.id!, type: 'structure' });
                                     setIsConfirmOpen(true);
                                   }}
                                   className="bg-white/10 rounded-xl hover:bg-red-600 hover:text-white"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                               </div>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setNewStructureMember({ ...newStructureMember, divisionId: division.id });
                            setIsAddStructureMemberOpen(true);
                          }}
                          className="h-full min-h-[80px] border-2 border-dashed border-white/5 rounded-2xl hover:border-blue-500/30 hover:bg-white/5 text-white/30 hover:text-blue-400 font-bold uppercase tracking-widest text-xs gap-2"
                        >
                          <Plus className="w-4 h-4" /> Tambah Anggota
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
                    <Tree className="w-12 h-12 text-white/10 mb-4" />
                    <p className="font-bold text-white/20 uppercase tracking-widest">Belum ada data struktur kepengurusan</p>
                    <p className="text-white/10 text-xs mt-2">Klik tombol Inisialisasi Data untuk memulai</p>
                  </div>
                )}
              </div>

              {/* Add Member Dialog */}
              <Dialog open={isAddStructureMemberOpen} onOpenChange={setIsAddStructureMemberOpen}>
                <DialogContent className="glass-card border-white/10 text-white sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-widest">Tambah Anggota</DialogTitle>
                    <DialogDescription className="text-white/40 text-xs">
                      Masukkan identitas pengurus baru ke dalam struktur.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-5 py-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nama Lengkap</Label>
                      <Input 
                        value={newStructureMember.name} 
                        onChange={(e) => setNewStructureMember({...newStructureMember, name: e.target.value})}
                        placeholder="Nama Lengkap"
                        className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Jabatan / Role</Label>
                      <Input 
                        value={newStructureMember.role} 
                        onChange={(e) => setNewStructureMember({...newStructureMember, role: e.target.value})}
                        placeholder="Contoh: Pradana"
                        className="bg-white/5 border-white/10 h-10 rounded-xl text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Foto Member</Label>
                      <div className="flex flex-col gap-3">
                        {newStructureMember.photoUrl && (
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-white/10 group">
                            <img src={newStructureMember.photoUrl} className="w-full h-full object-cover" />
                            <button 
                              onClick={() => setNewStructureMember({...newStructureMember, photoUrl: ""})}
                              className="absolute inset-0 bg-red-600/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 500000) {
                                toast.error("File terlalu besar. Maksimal 500KB.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewStructureMember({...newStructureMember, photoUrl: reader.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="bg-white/5 border-white/10 h-9 rounded-xl text-[10px] file:bg-blue-600 file:border-none file:text-white file:rounded-md file:mr-2 file:px-2 file:py-0.5" 
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="ghost" onClick={() => setIsAddStructureMemberOpen(false)} className="rounded-xl text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Batal</Button>
                    <Button onClick={handleAddStructureMember} className="bg-blue-600 hover:bg-blue-500 rounded-xl px-6 text-xs font-bold uppercase tracking-widest">Tambah</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Member Dialog */}
              <Dialog open={isEditStructureOpen} onOpenChange={setIsEditStructureOpen}>
                <DialogContent className="glass-card border-white/10 text-white sm:max-w-[380px] p-6 lg:p-8">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold uppercase tracking-widest text-blue-400">Edit Anggota</DialogTitle>
                    <DialogDescription className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                      Perbarui Data Kepengurusan
                    </DialogDescription>
                  </DialogHeader>
                  
                  {editingMember && (
                    <div className="grid gap-4 py-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nama Lengkap</Label>
                        <Input 
                          value={editingMember.name} 
                          onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                          className="bg-white/5 border-white/10 h-11 rounded-xl text-xs" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Jabatan / Role</Label>
                        <Input 
                          value={editingMember.role} 
                          onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                          className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-bold text-blue-400" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Divisi</Label>
                        <Select 
                          value={editingMember.divisionId} 
                          onValueChange={(val) => setEditingMember({...editingMember, divisionId: val})}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-xs">
                            <SelectValue placeholder="Pilih Divisi" />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10 text-white">
                            {structureDivisions.map(div => (
                              <SelectItem key={div.id} value={div.id} className="text-xs uppercase font-bold">{div.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Foto Member</Label>
                        <div className="flex items-center gap-3">
                          {editingMember.photoUrl && (
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 group flex-shrink-0">
                              <img src={editingMember.photoUrl} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setEditingMember({...editingMember, photoUrl: ""})}
                                className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          )}
                          <div className="flex-1">
                             <Input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 500000) {
                                    toast.error("File terlalu besar. Maksimal 500KB.");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditingMember({...editingMember, photoUrl: reader.result as string});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="bg-white/5 border-white/10 h-10 rounded-xl text-[10px] w-full cursor-pointer file:bg-blue-600 file:border-none file:text-white file:rounded-md file:mr-2 file:px-2 file:py-0.5" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="gap-3 sm:gap-2 mt-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditStructureOpen(false)}
                      className="flex-1 sm:flex-none rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 order-2 sm:order-1"
                    >
                      Batal
                    </Button>
                    <Button 
                      onClick={handleUpdateStructureMember}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 rounded-xl px-8 gap-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 order-1 sm:order-2"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}

          {activeTab === "konten" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-white/5 rounded-[3rem] p-10 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Integrasi & Pengaturan Konten</h2>
              </div>

              <div className="flex-1 overflow-auto no-scrollbar space-y-8 pr-4">
                {/* Google Sheets Integration */}
                <div className="glass-card p-8 border-white/5 bg-white/2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center border border-green-500/20">
                      <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Sinkronisasi Google Sheets</h3>
                      <p className="text-white/40 text-xs">Hubungkan data pendaftaran langsung ke spreadsheet Anda.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">URL Webhook Apps Script</Label>
                       <div className="flex flex-col sm:flex-row gap-4">
                         <Input 
                            value={appsScriptUrl}
                            onChange={(e) => setAppsScriptUrl(e.target.value)}
                            placeholder="https://script.google.com/macros/s/.../exec"
                            className="bg-white/5 border-white/10 h-12 rounded-xl flex-1 text-sm font-mono"
                         />
                         <div className="flex gap-2">
                           <Button 
                              onClick={handleSaveWebhook} 
                              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-6 font-bold h-12 transition-all"
                           >
                             <Save className="w-4 h-4 mr-2" /> Simpan
                           </Button>
                           <Button 
                              onClick={handleTestWebhook} 
                              className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-10 font-bold h-12 shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02]"
                           >
                             Uji Koneksi
                           </Button>
                         </div>
                       </div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5">
                       <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
                         <Settings className="w-3 h-3" /> Petunjuk Penggunaan:
                       </h4>
                       <ul className="text-[10px] text-white/40 space-y-2 list-disc ml-5 leading-relaxed">
                         <li>Buka Google Sheets Anda, lalu klik menu <strong className="text-white/60 font-bold">Extensions &gt; Apps Script</strong>.</li>
                         <li>Hapus semua kode yang ada, lalu tempelkan kode berikut (scroll untuk melihat semua):
                           <pre className="bg-black/40 p-4 rounded-xl mt-2 overflow-x-auto text-[9px] text-green-400 font-mono border border-white/5 max-h-[150px] custom-scrollbar">
{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.action === "test_connection") {
    // Hanya uji koneksi
    sheet.appendRow([new Date(), "SYSTEM", "Uji Koneksi Berhasil", data.data.message]);
  } else {
    // Simpan data pendaftaran/anggota
    var row = [
      new Date(), 
      data.action, 
      data.data.fullName || data.data.name,
      data.data.jurusan,
      data.data.phone
    ];
    sheet.appendRow(row);
  }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}`}
                           </pre>
                         </li>
                         <li>Klik <strong className="text-white/60 font-bold">Deploy &gt; New Deployment</strong>, pilih tipe <strong className="text-white/60 font-bold">Web App</strong>.</li>
                         <li>Atur <strong className="text-white/60 font-bold">Who has access</strong> menjadi <strong className="text-white/60 font-bold">Anyone</strong>.</li>
                         <li>Salin URL Web App dan tempelkan pada kolom di atas.</li>
                       </ul>
                    </div>
                  </div>
                </div>

                {/* Stats Section Editor */}
                <div className="glass-card p-8 border-white/5 bg-white/2">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center border border-green-500/20">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Statistik Organisasi</h3>
                        <p className="text-green-400 text-[10px] sm:text-xs font-semibold">✓ Nilai disinkronisasikan secara otomatis dengan data struktur organisasi.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveStats} 
                      disabled={isSavingContent}
                      className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-10 font-bold h-12 shadow-lg shadow-green-500/20"
                    >
                      <Save className="w-4 h-4 mr-2" /> Simpan Statistik
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="space-y-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Label Statistik</Label>
                          <Input 
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...stats];
                              newStats[idx].label = e.target.value;
                              setStats(newStats);
                            }}
                            className="bg-white/5 border-white/10 h-10 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Nilai (Dihitung Otomatis)</Label>
                          <Input 
                            value={stat.value}
                            readOnly
                            className="bg-white/5 border-white/10 h-10 rounded-xl text-lg font-bold text-green-400 select-all cursor-default"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer CTA Section Editor */}
                <div className="glass-card p-8 border-white/5 bg-white/2">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20">
                        <Save className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Call to Action (Footer)</h3>
                        <p className="text-white/40 text-xs">Ubah ajakan bergabung di bagian bawah halaman utama.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveFooter} 
                      disabled={isSavingContent}
                      className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-10 font-bold h-12 shadow-lg shadow-purple-500/20"
                    >
                      <Save className="w-4 h-4 mr-2" /> Simpan Footer
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Judul CTA</Label>
                       <Input 
                         value={footerCta.title}
                         onChange={(e) => setFooterCta({...footerCta, title: e.target.value})}
                         className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-bold"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sub-kalimat Ajakan</Label>
                       <Input 
                         value={footerCta.subtitle}
                         onChange={(e) => setFooterCta({...footerCta, subtitle: e.target.value})}
                         className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Teks Tombol</Label>
                       <Input 
                         value={footerCta.buttonText}
                         onChange={(e) => setFooterCta({...footerCta, buttonText: e.target.value})}
                         className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold text-purple-400"
                       />
                    </div>
                  </div>
                </div>

                 <div className="p-10 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center bg-white/1">
                   <p className="text-white/20 text-xs font-bold uppercase tracking-widest leading-relaxed">
                     Pengaturan Konten Lainnya (Galeri, News) Akan Tersedia Pada Update Mendatang
                   </p>
                 </div>

                {/* Logo Section Editor */}
                <div className="glass-card p-8 border-white/5 bg-white/2">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Logo Organisasi</h3>
                        <p className="text-white/40 text-xs">Ubah logo utama yang tampil di seluruh website.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveBrand} 
                      disabled={isSavingContent}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-10 font-bold h-12 shadow-lg shadow-indigo-500/20"
                    >
                      <Save className="w-4 h-4 mr-2" /> Simpan Logo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">URL Logo (.png / .svg / .jpg)</Label>
                        <Input 
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://..."
                          className="bg-white/5 border-white/10 h-12 rounded-xl text-xs font-mono"
                        />
                        <p className="text-[10px] text-white/20 italic mt-1">*Pastikan URL logo dapat diakses publik.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-[2rem] border border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Preview Logo</p>
                      {logoUrl ? (
                        <div className="w-32 h-32 flex items-center justify-center bg-white/5 rounded-2xl p-4 overflow-hidden">
                          <img src={logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-white/5 rounded-2xl flex items-center justify-center border-2 border-dashed border-white/10">
                          <Tree className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero Section Editor */}
                <div className="glass-card p-8 border-white/5 bg-white/2">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Pengaturan Hero Utama</h3>
                        <p className="text-white/40 text-xs">Ubah teks pembuka pada halaman depan website.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSaveHero} 
                      disabled={isSavingContent}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-10 font-bold h-12 shadow-lg shadow-blue-500/20"
                    >
                      {isSavingContent ? <RotateCcw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Simpan Hero
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Judul Utama (Hero Title)</Label>
                      <Input 
                        value={heroContent.title}
                        onChange={(e) => setHeroContent({...heroContent, title: e.target.value})}
                        className="bg-white/5 border-white/10 h-12 rounded-xl text-lg font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Subjudul (Hero Subtitle)</Label>
                      <textarea 
                        value={heroContent.subtitle}
                        onChange={(e) => setHeroContent({...heroContent, subtitle: e.target.value})}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Teks Tombol CTA</Label>
                      <Input 
                        value={heroContent.cta}
                        onChange={(e) => setHeroContent({...heroContent, cta: e.target.value})}
                        className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold text-blue-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Activities Slider Editor */}
                <div className="glass-card p-8 border-white/5 bg-white/2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Galeri Dokumentasi &amp; Slider</h3>
                        <p className="text-white/40 text-xs">Kelola daftar foto, tanggal, dan deskripsi kegiatan yang tampil di Galeri Dokumentasi dan Slider Beranda.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={handleAddActivity}
                        className="rounded-xl border-white/10 text-white hover:bg-white/5 font-bold h-12 text-xs"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Tambah Foto
                      </Button>
                      <Button 
                        onClick={handleSaveActivities} 
                        disabled={isSavingContent}
                        className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-8 font-bold h-12 text-xs shadow-lg shadow-amber-500/20"
                       >
                        <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
                      </Button>
                    </div>
                  </div>

                  {/* Header page settings edit */}
                  <div className="p-6 mb-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Pengaturan Keterangan Galeri & Dokumentasi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Judul Halaman Dokumentasi</Label>
                        <Input 
                          value={dokumentasiHeader.title}
                          onChange={(e) => setDokumentasiHeader({...dokumentasiHeader, title: e.target.value})}
                          placeholder="Contoh: Dokumentasi Kegiatan Ambalan"
                          className="bg-white/5 border-white/10 h-10 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Deskripsi Halaman Dokumentasi</Label>
                        <textarea 
                          value={dokumentasiHeader.desc}
                          onChange={(e) => setDokumentasiHeader({...dokumentasiHeader, desc: e.target.value})}
                          placeholder="Tulis deksripsi singkat konten media ambalan..."
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 p-3 text-xs rounded-xl text-white/60 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity, idx) => (
                      <div key={idx} className="glass-card p-6 bg-white/2 border-white/5 group relative flex flex-col justify-between">
                        <button 
                          onClick={() => handleRemoveActivity(idx)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div>
                          <div className="aspect-video rounded-xl bg-black/40 overflow-hidden mb-4 border border-white/5 relative">
                            {activity.url ? (
                              <img src={activity.url} className="w-full h-full object-cover animate-fade-in" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/10 uppercase text-[10px] font-bold tracking-widest">
                                Preview Foto
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Nama Kegiatan</Label>
                              <Input 
                                value={activity.title}
                                onChange={(e) => handleUpdateActivity(idx, 'title', e.target.value)}
                                className="bg-white/5 border-white/10 h-10 rounded-xl text-xs font-bold"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tanggal Kegiatan</Label>
                              <Input 
                                value={activity.date || ""}
                                onChange={(e) => handleUpdateActivity(idx, 'date', e.target.value)}
                                placeholder="Contoh: 24 April 2026"
                                className="bg-white/5 border-white/10 h-10 rounded-xl text-xs font-medium"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Deskripsi Singkat</Label>
                              <textarea 
                                value={activity.desc || ""}
                                onChange={(e) => handleUpdateActivity(idx, 'desc', e.target.value)}
                                placeholder="Jelaskan momen petualangan/kegiatan ini..."
                                rows={2}
                                className="w-full h-16 bg-white/5 border border-white/15 p-3 text-xs rounded-xl text-white/75 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none leading-relaxed"
                              />
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Unggah Gambar / URL</Label>
                              <div className="flex flex-col gap-2">
                                <Input 
                                  value={activity.url}
                                  onChange={(e) => handleUpdateActivity(idx, 'url', e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="bg-white/5 border-white/10 h-8 rounded-lg text-[9px] font-mono"
                                />
                                <div className="text-[9px] text-white/20 uppercase font-bold text-center">Atau Unggah File</div>
                                <Input 
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const toastId = toast.loading("Sedang merender & mengkompresi gambar...");
                                      try {
                                        const base64 = await compressImage(file);
                                        handleUpdateActivity(idx, 'url', base64);
                                        toast.success("Gambar berhasil diproses!", { id: toastId });
                                      } catch (error) {
                                        toast.error("Gagal memproses gambar.", { id: toastId });
                                      }
                                    }
                                  }}
                                  className="bg-white/5 border-white/10 h-9 rounded-xl text-[9px] w-full cursor-pointer file:bg-amber-600 file:border-none file:text-white file:rounded-md file:mr-2 file:px-2 file:py-0.5 font-bold" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/20 font-bold uppercase tracking-widest text-sm">
                        Belum ada foto kegiatan.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Global Confirm Delete Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="glass-card border-white/10 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-widest text-red-500">Konfirmasi Hapus</DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Apakah Anda yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsConfirmOpen(false);
                setItemToDelete(null);
              }}
              className="rounded-xl text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white"
            >
              Batal
            </Button>
            <Button 
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-500 rounded-xl px-8 text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20"
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
