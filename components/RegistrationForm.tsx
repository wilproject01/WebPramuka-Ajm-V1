import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "motion/react";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  jurusan: z.string().min(2, "Jurusan/Kelas wajib diisi"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

type FormValues = z.infer<typeof formSchema>;

export function RegistrationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, "registrations"), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 2. Sync to Google Spreadsheet (Optional Webhook)
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "google_sheets"));
        const webhookUrl = settingsDoc.exists() ? settingsDoc.data().value : null;

        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "calon_anggota",
              data: {
                id: docRef.id,
                ...data,
                createdAt: new Date().toISOString()
              }
            }),
          });
        }
      } catch (err) {
        console.error("Spreadsheet sync failed:", err);
      }

      toast.success("Pendaftaran berhasil terkirim!");
      setIsSuccess(true);
      reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "registrations");
      toast.error("Gagal mengirim berkas pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-32 px-6 bg-pramuka-blue-dark min-h-[80vh] flex flex-col items-center justify-center text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-card p-12 max-w-md w-full"
        >
          <div className="bg-green-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40">
            <Send className="text-white w-10 h-10" />
          </div>
          <h2 className="text-4xl font-display font-bold text-white mb-4">Terima Kasih!</h2>
          <p className="text-white/50 mb-8">Data pendaftaran Anda telah kami terima. Tim kami akan segera menghubungi Anda melalui WhatsApp.</p>
          <button 
            onClick={() => navigate("/")}
            className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl py-4 font-bold shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
          >
            SELESAI
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 bg-pramuka-blue-dark">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8 md:mb-16">
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4 tracking-tight text-white uppercase">
              Formulir Pendaftaran
            </h2>
            <p className="text-white/40 text-sm sm:text-base">
              Silahkan isi data diri Anda untuk bergabung dengan PRAMUKA AJM SMKN 2 GARUT.
            </p>
          </div>

          <Card className="glass-card overflow-hidden shadow-2xl border-white/5">
            <div className="bg-blue-400 h-2 w-full" />
            <CardHeader className="pt-8 sm:pt-12 px-6 sm:px-10">
              <CardTitle className="text-2xl sm:text-3xl font-display flex items-center gap-3 text-white">
                <Sparkles className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
                Data Calon Anggota
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 pt-4 sm:pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-10">
                <div className="grid grid-cols-1 gap-6 sm:gap-10">
                  <div className="space-y-3 sm:space-y-4">
                    <Label htmlFor="fullName" className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30">Nama Lengkap</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Nama Lengkap" 
                      className="rounded-xl sm:rounded-2xl bg-white/5 border-white/5 text-white h-12 sm:h-16 px-4 sm:px-6 text-base sm:text-lg focus:border-blue-500/50 transition-all font-medium"
                      {...register("fullName")}
                    />
                    {errors.fullName && <p className="text-[10px] text-red-400 font-bold">{errors.fullName.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <div className="space-y-3 sm:space-y-4">
                      <Label htmlFor="jurusan" className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30">Jurusan / Kelas</Label>
                      <Input 
                        id="jurusan" 
                        placeholder="Contoh: XII TI A" 
                        className="rounded-xl sm:rounded-2xl bg-white/5 border-white/5 text-white h-12 sm:h-16 px-4 sm:px-6 text-base sm:text-lg focus:border-blue-500/50 transition-all font-medium"
                        {...register("jurusan")}
                      />
                      {errors.jurusan && <p className="text-[10px] text-red-400 font-bold">{errors.jurusan.message}</p>}
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <Label htmlFor="phone" className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30">WhatsApp</Label>
                      <Input 
                        id="phone" 
                        placeholder="08XXXXXXXXXX" 
                        className="rounded-xl sm:rounded-2xl bg-white/5 border-white/5 text-white h-12 sm:h-16 px-4 sm:px-6 text-base sm:text-lg focus:border-blue-500/50 transition-all font-medium"
                        {...register("phone")}
                      />
                      {errors.phone && <p className="text-[10px] text-red-400 font-bold">{errors.phone.message}</p>}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl sm:rounded-3xl py-6 sm:py-10 h-auto text-lg sm:text-2xl font-black gap-3 sm:gap-4 shadow-2xl shadow-blue-500/40 transition-all uppercase tracking-widest group"
                >
                  {isSubmitting ? "MENGIRIM..." : (
                    <>
                      KIRIM DATA
                      <Send className="w-5 h-5 sm:w-8 sm:h-8 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </Button>
                
                <p className="text-center text-[10px] text-white/20 font-bold uppercase tracking-[0.4em] pt-4">
                  Privacy Secured & Encrypted
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
