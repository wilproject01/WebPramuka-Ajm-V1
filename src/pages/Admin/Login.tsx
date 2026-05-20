import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/App";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Trees as Tree, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", "brand"), (snapshot) => {
      if (snapshot.exists()) {
        setLogoUrl(snapshot.data().logoUrl || "");
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast.success("Login Dashboard Admin Berhasil!");
      navigate("/admin");
    } else {
      toast.error("Username atau password salah!");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#0f172a]">
      {/* Back Button */}
      <Link to="/" className="absolute top-8 right-8 z-50">
        <button className="w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-red-500 hover:scale-110 text-white/30 hover:text-white rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 group shadow-2xl border border-white/5">
          <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </Link>
      {/* Background Orbs */}
      <div className="glow-orb top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/30" />
      <div className="glow-orb bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-600/10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
          <div className="bg-blue-600 h-2 w-full" />
          <CardHeader className="pt-12 px-10 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 overflow-hidden p-1.5">
               {logoUrl ? (
                 <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <Tree className="w-10 h-10 text-white" />
               )}
            </div>
            <CardTitle className="text-3xl font-display font-bold text-white tracking-tight">Admin Login</CardTitle>
            <CardDescription className="text-white/40 mt-2">
              MASUK MENUJU KENDALI PUSAT PRAMUKA AJM SMKN 2 GARUT
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Admin Identifier</Label>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Username atau Email" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded-2xl bg-white/5 border-white/5 text-white h-14 pl-12 focus:border-blue-500/50 transition-all"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Security Key</Label>
                <div className="relative">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-2xl bg-white/5 border-white/5 text-white h-14 pl-12 focus:border-blue-500/50 transition-all"
                    required
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                     <Lock className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-8 h-auto text-lg font-bold shadow-xl shadow-blue-500/20 transition-all"
              >
                AUTHENTICATE
              </Button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
               <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Restricted Access Area</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
