# ⚜️ OFFICIAL WEBSITE PRAMUKA AJM SMKN 2 GARUT

[![Pramuka Digital](https://img.shields.io/badge/Pramuka-Digital%20Platform-blue?style=for-the-badge&logo=pramuka&logoColor=white)](https://ai.studio/build)
[![Built with React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Styled with Tailwind v4](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Database Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

<ctrl94> **OFFICIAL WEBSITE PRAMUKA AJM** 
> Bukan sekadar pusat profil biasa. Sistem ini dirancang untuk memudahkan para pengurus ambalan AJM saat penerimaan anggota baru yang biasanya pada saat MPLS, selain itu web ini juga bisa sebagai media untuk menunjukan kegiatan yang kita lakukan kepada calon calon anggota baru.

---

## PREVIEW TAMPILAN DESKTOP
<img width="1360" height="612" alt="Screenshot_2026-06-17_22-23-42" src="https://github.com/user-attachments/assets/87c2740e-ee14-42f1-9abb-976533fc8645" />
<img width="1366" height="612" alt="Screenshot_2026-06-17_22-24-28" src="https://github.com/user-attachments/assets/d5ae9103-74f5-42fa-98ec-cbb7da28ebe5" />
 <img width="1365" height="561" alt="webwilden_editstruktur" src="https://github.com/user-attachments/assets/5a116245-2f3f-4e1a-ac38-6f6b5b1f3f5a" />

 ---

## PREVIEW TAMPILAN ANDROID
<img width="1080" height="2066" alt="WhatsApp Image 2026-06-17 at 22 30 02" src="https://github.com/user-attachments/assets/0e8a10c2-ac26-4c38-861c-38f21e3a9e3a" />
<img width="1080" height="2059" alt="WhatsApp Image 2026-06-17 at 22 29 56" src="https://github.com/user-attachments/assets/1476f7e7-5baa-4b12-a0d7-666d683ec6a0" />
<img width="1080" height="2063" alt="WhatsApp Image 2026-06-17 at 22 30 47" src="https://github.com/user-attachments/assets/b434faf4-c876-4a1a-82bc-6fa7915d0c44" />

---

## 🛠️ Fitur-Fitur Unggulan

### 1. 🏡 Beranda & Galeri Dinamis 
*   Sebuah panel penyambut yang megah yang dilengkapi dengan sajian kolase foto bertumpuk (*collage stacked presentation*) yang interaktif.

### 2. 📝 Pendaftaran Online Real-Time
*   Formulir pendaftaran calon anggota baru yang bersih (*clean UI*) terintegrasi langsung ke database Firebase dan juga SpreadSheet yang memudahkan penyalinan data.
*   Validasi tingkat tinggi memastikan data registrasi yang dikirimkan terjaga kepresisian dan strukturnya.

### 3. 📸 Galeri Dokumentasi Tanpa Batas (*Dokumentasi Kegiatan*)
*   Setiap foto dilengkapi visual detail seperti tanggal, deskripsi momen berharga, serta fitur tampilan interaktif dalam modal detail *lightbox carousel*.

### 4. 🎛️ Dashboard Admin Super Power (*The Command Center*)
Panel eksklusif untuk admin ambalan guna mengendalikan penuh isi konten situs:
*   **Manajemen Kegiatan & Foto**: Menambah, memperbarui informasi judul, deskripsi kegiatan, tanggal, serta tautan gambar.
*   **Fitur Pengompres Gambar Instan**: Unggah file gambar langsung dari perangkat Anda—sistem akan memproses dan mengompres ukuran gambar secara lokal di peramban memanfaatkan *Canvas rendering pipeline* sebelum disimpan untuk menghemat ruang kueri database.
*   **Pengendali Keterangan Galeri**: Pembaruan judul header dan paragraf deskripsi halaman dokumentasi secara langsung dari dashboard tanpa menyentuh kode program.
*   **Pemantau Pendaftaran**: List pendaftar masuk terdaftar secara saksama dalam format tabel interaktif dengan konfirmasi status pendaftaran.

---

## 📐 Arsitektur & Teknologi

Sistem dibangun menggunakan paradigma fullstack modern dengan pemisahan fungsionalitas yang ideal:

| Lapisan | Teknologi Utama | Deskripsi |
| :--- | :--- | :--- |
| **Frontend UI/UX** | React 19, TypeScript, Tailwind CSS v4, Motion | Antarmuka berkinerja tinggi, responsif di seluruh perangkat, kaya akan micro-interactions yang elegan. |
| **Backend Node.js** | Express Server, Vite Dev Middleware | Server handal yang menyajikan aset web dengan kompresi statis saat produksi dan mendukung hot reload saat pengembangan. |
| **Database & Sec** | Google Firebase Firestore, Firebase Auth | Penyimpanan data dokumen terdistribusi secara instan (real-time listeners menggunakan `onSnapshot`) dan sistem autentikasi aman. |
| **Koleksi Ikon** | Lucide React | Sistem ikon minimalis yang tajam dan seragam di semua komponen. |

---

## 📁 Struktur Direktori

```text
├── components/          # Komponen UI global (Navbar, Hero, Footer, dll.)
├── src/
│   ├── pages/
│   │   ├── Admin/       # Panel Dashboard Kendali Kreatif & Login Administrator
│   │   └── Dokumentasi.tsx # Halaman Galeri Dokumentasi Interaktif Pengunjung
│   ├── App.tsx          # Sentral Routing & Manajemen Layout Utama
│   ├── index.css        # Konfigurasi Tailwind CSS v4 Global & Font Pairing
│   └── main.tsx         # Root Rendering Engine React
├── server.ts            # Kompilasi Backend Express penyaji aplikasi
├── package.json         # Konfigurasi Manifes Dependensi & Skrip Jalur Build
└── metadata.json        # Metadata resmi sistem komputasi Cloud Run
```

---

## 🚀 Panduan Memulai & Pengembangan

Ikuti petunjuk di bawah ini untuk menjalankan repositori di mesin lokal Anda.

### Persyaratan Sistem
*   Node.js v18 atau versi terbaru
*   Akses kueri database Firebase Firestore

### Jalankan di Mesin Lokal

1.  **Padukan Dependensi**:
    ```bash
    npm install
    ```

2.  **Mulai Server Pengembangan**:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`.

3.  **Kompilasi Jalur Produksi**:
    ```bash
    npm run build
    ```
    Skrip ini secara inovatif akan mengeksekusi kompilasi aset frontend statis melalui Vite dan mem-bundle runtime server Express ke dalam format `dist/server.cjs` menggunakan `esbuild`.

4.  **Menjalankan Mode Produksi**:
    ```bash
    npm run start
    ```

---

## 🛡️ Hak Cipta & Lisensi

Aplikasi ini dibuat dan dikembangkan sepenuhnya oleh **Wilden Widya Is Nanda** selaku pengembang utama platform digital ini.

*   **Hak Cipta © 2026 Wilden** (`wildenbusiness01@gmail.com`). Hak cipta dilindungi undang-undang.
*   **Lisensi**: Didistribusikan di bawah **MIT License**. Anda bebas menggunakan, memodifikasi, dan menyebarkan kode program ini untuk keperluan pengembangan kepramukaan dan pendidikan dengan tetap mencantumkan atribusi pembuat asli.

---

