# ⚜️ OFFICIAL WEBSITE PRAMUKA AJM SMKN 2 GARUT

[![Pramuka Digital](https://img.shields.io/badge/Pramuka-Digital%20Platform-blue?style=for-the-badge&logo=pramuka&logoColor=white)](https://ai.studio/build)
[![Built with React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Styled with Tailwind v4](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Database Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

<ctrl94> **TANDANG, JUANG, MEUNANG.** 
> Sebuah platform digital interaktif masa kini sebagai media perwajahan yang dinamis bagi **Ambalan Ir. H. Juanda & Laksamana Malahayati SMKN 2 Garut**. Dirancang dengan memadukan nilai keluhuran gerakan Pramuka bersanding dengan akselerasi teknologi modern.

---

<img width="1358" height="611" alt="Screenshot_2026-06-16_12-09-04" src="https://github.com/user-attachments/assets/ef20df4b-eb29-4922-acf1-62b11804fe5e" />





## 🌌 Visi Utama & Esensi Desain

**OFFICIAL WEBSITE PRAMUKA AJM** Bukan sekadar pusat profil biasa. Sistem ini dirancang untuk memudahkan para pengurus ambalan AJM saat penerimaan anggota baru yang biasanya pada MPLS, selain itu web ini juga bisa sebagai media untuk menunjukan kegiatan yang kita lakukan kepada calon calon anggota baru.
**"Cosmic Deep Blue"** yang kokoh, tajam, dan elegan—merefleksikan keteguhan perjuangan, persaudaraan tanpa batas di alam semesta, serta disiplin tinggi gerakan Pramuka. 


---

## 🛠️ Fitur-Fitur Unggulan

### 1. 🏡 Beranda & Galeri Dinamis 
*   Sebuah panel penyambut yang megah yang dilengkapi dengan sajian kolase foto bertumpuk (*collage stacked presentation*) yang interaktif.
*   Slider kegiatan terintegrasi yang senantiasa bergerak dinamis menampilkan memori petualangan pramuka paling segar.

### 2. 📝 Pendaftaran Online Real-Time
*   Formulir pendaftaran calon anggota baru yang bersih (*clean UI*) terintegrasi langsung ke database Firebase dan juga SpreadSheet yang memudahkan penyalinan data.
*   Validasi tingkat tinggi memastikan data registrasi yang dikirimkan terjaga kepresisian dan strukturnya.

### 3. 📸 Galeri Dokumentasi Tanpa Batas (*Dokumentasi Kegiatan*)
*   Halaman galeri album foto lengkap dengan pencarian interaktif instan bertenaga pencocokan filter karakter kilat.
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

## 💡 Inovasi Hebat di Balik Layar

### ⚡ Kompresi Gambar Berkinerja Tinggi (*Canvas Native Compression*)
Kami menyematkan mesin pembaca gambar klien memanfaatkan kombinasi `FileReader` dan penggambaran ulang pada `HTML5 Canvas` secara adaptif sebelum konversi Base64 dilakukan. Hasilnya? Gambar besar berukuran megabyte dapat dikompresi menjadi puluhan kilobyte saja dalam pecahan milidetik tanpa membebani server/cloud API berbayar.

### 🔄 Sinkronisasi Sinkron Real-time (*Reactive Firebase Hook*)
Halaman **Dokumentasi Kegiatan** dan **Beranda** tidak memerlukan penyegaran ulang (*refresh*) browser untuk mendapatkan update dari Admin Dashboard. Berkat pemanfaatan listener kueri reaktif `onSnapshot` Firebase, perubahan apa pun yang disimpan oleh admin akan langsung mengalir ke UI semua pengunjung secara instan dan dramatis!

---

## 🛡️ Hak Cipta & Lisensi

Aplikasi ini dibuat dan dikembangkan sepenuhnya oleh **Wilden Widya Is Nanda** selaku pengembang utama platform digital ini.

*   **Hak Cipta © 2026 Wilden** (`wildenbusiness01@gmail.com`). Hak cipta dilindungi undang-undang.
*   **Lisensi**: Didistribusikan di bawah **MIT License**. Anda bebas menggunakan, memodifikasi, dan menyebarkan kode program ini untuk keperluan pengembangan kepramukaan dan pendidikan dengan tetap mencantumkan atribusi pembuat asli.

---

