# httpjs

## Deskripsi
httpjs adalah server HTTP/HTTPS sederhana berbasis Node.js yang dilengkapi fitur keamanan, deteksi DDoS, auto-block, logging lengkap, dan landing page modern. Cocok untuk proteksi website, edukasi, atau showcase keamanan web.

---

## Fitur Utama
- **Landing Page Modern**: Menggunakan Bootstrap, FontAwesome, animasi, dan efek glassmorphism.
- **Deteksi & Block DDoS/Spam**: Auto block IP yang spam/refresh berlebihan.
- **Permanent Block**: IP yang 3x terblokir dalam 24 jam akan diblokir permanen (disimpan di `blacklisted.json`).
- **Halaman Blocked**: Halaman khusus untuk blokir sementara & permanen, dengan auto-redirect dan info blokir.
- **Logging Lengkap**:
  - Semua akses HTTP/HTTPS (method, url, IP, user-agent)
  - Deteksi & log bot/check-host/curl/wget/scan
  - Log file access, file not found, file change
  - Log block/unblock/permanent block
- **Deteksi Check-Host**: Jika ada spam check-host.net/uptimerobot/pingdom, request di-timeout dan dicatat di log.
- **Cloudflare Tunnel Friendly**: Mendukung x-forwarded-for untuk real IP.
- **Auto Reload (nodemon)**: Perubahan file langsung reload server.

---

## Instalasi & Setup
1. **Clone repo & install dependencies**
   ```bash
   git clone <repo-url>
   cd httpjs
   npm install
   ```
2. **Jalankan server**
   ```bash
   npm run dev   # mode development (auto reload)
   npm start     # mode production
   ```
3. **Akses di browser**
   - [http://localhost:8000](http://localhost:8000)

---

## Struktur Folder
```
httpjs/
├── server.js              # Main server
├── package.json           # Konfigurasi npm
├── blacklisted.json       # Daftar IP permanent block
├── view/
│   ├── index.html         # Landing page
│   ├── blocked.html       # Halaman blokir sementara
│   └── permanent_blocked.html # Halaman blokir permanen
└── README.md
```

---

## Fitur Keamanan
- **Block Sementara**: Spam >10x/5 detik → blokir 10 detik.
- **Permanent Block**: 3x terblokir/24 jam → permanent block (auto redirect ke halaman khusus).
- **Unblock**: Hapus IP dari `blacklisted.json` untuk membuka blokir permanen.
- **Deteksi Bot/Check-Host**: Semua request bot/scan/log dicatat, spam >5x/menit → timeout.
- **Cloudflare Tunnel**: Otomatis deteksi real IP dari header.

---

## Logging
- Semua log tampil di console (warna & label jelas):
  - HTTP REQ: Semua request masuk
  - CHECK-HOST: Deteksi bot/check-host/scan
  - CHECK-HOST-TIMEOUT: Request check-host di-timeout
  - BLOCKED/UNBLOCK/PERM BLOCK: Event blokir
  - FILE ACCESS/FILE CHANGE: Akses & perubahan file
- Bisa diintegrasi ke file log eksternal jika diinginkan.

---

## Kustomisasi
- **Landing Page**: Edit `view/index.html` sesuai branding/tim kamu.
- **Halaman Blocked**: Edit `view/blocked.html` & `view/permanent_blocked.html`.
- **Threshold Block**: Ubah nilai di `server.js` (misal: `MAX_BLOCKS`, `BLOCK_TIME`, dll).
- **Port/Host**: Ubah di variabel `port` & `hostname` di `server.js`.

---

## Catatan Penting
- **Ping/ICMP**: Node.js tidak bisa log/block ping, lakukan di firewall OS.
- **TCP Check**: Hanya HTTP/HTTPS yang bisa dideteksi/log di aplikasi ini.
- **Cloudflare Tunnel**: Pastikan tunnel hanya expose port HTTP/HTTPS.

---

## Kontribusi & Lisensi
- Bebas digunakan & dimodifikasi.
- Untuk kontribusi, silakan pull request atau kontak admin.

---

## Author
Protected By **R.A.S Cyber Team** 