# httpjs

## Deskripsi
httpjs adalah server HTTP/HTTPS sederhana berbasis Node.js dengan fitur keamanan modern, deteksi DDoS, auto-block, logging lengkap, modularisasi middleware, dan dashboard admin. Cocok untuk proteksi website, edukasi, atau showcase keamanan web.

---

## Fitur Utama & Keamanan
- **Modular Middleware**: Semua fitur keamanan dipisah di folder `antiddos/` (mudah dikembangkan).
- **Whitelist/Blacklist IP**: Manajemen via file & endpoint admin.
- **Captcha Otomatis**: User harus isi captcha jika terblokir sementara.
- **Statistik & Dashboard**: Endpoint `/admin/stats` & `/admin/monitor` untuk monitoring real-time (hanya whitelist IP).
- **Logging Lengkap**: Semua event penting dicatat ke file log harian di folder `logs/`.
- **Notifikasi Admin**: Event penting (block permanen, DDoS) bisa dikirim ke file, email, webhook, dsb.
- **Rate Limiting**: Per-IP, per-endpoint, per-token/cookie, dan per-path.
- **GeoIP Blocking**: Blokir negara tertentu (default: CN, RU, BR).
- **User-Agent Filtering**: Blacklist/whitelist UA, blokir bot/UA mencurigakan.
- **Pattern Analysis**: Deteksi scanning, brute force, dan blokir otomatis.
- **Maintenance Mode**: Hanya whitelist IP yang bisa akses saat maintenance.
- **Blocklist Sync**: Sinkronisasi blocklist dari sumber eksternal (misal: FireHOL).
- **Export/Import Blocklist**: Backup/restore blocklist via endpoint admin.
- **API Admin**: Endpoint untuk tambah/hapus IP dari blocklist/whitelist.
- **Custom Block Message**: Pesan blokir berbeda sesuai alasan (DDoS, UA, dsb).

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
├── server.js                # Main server (entry point)
├── package.json             # Konfigurasi npm
├── blacklisted.json         # Daftar IP permanent block
├── whitelist.json           # Daftar IP whitelist
├── maintenance.json         # Status mode maintenance
├── logs/                    # Folder log harian & event penting
├── antiddos/                # Semua middleware keamanan (modular)
│   ├── whitelist.js
│   ├── logger.js
│   ├── stats.js
│   ├── captcha.js
│   ├── notifier.js
│   ├── endpointLimiter.js
│   ├── blockMessage.js
│   ├── userAgentList.js
│   ├── geoipBlock.js
│   ├── maintenance.js
│   ├── blocklistApi.js
│   ├── blocklistSync.js
│   ├── patternAnalysis.js
│   ├── tokenLimiter.js
│   ├── webhook.js
│   ├── blocklistExport.js
│   ├── pathBlocker.js
│   └── monitor.js
├── view/
│   ├── index.html           # Landing page
│   ├── blocked.html         # Halaman blokir sementara
│   ├── permanent_blocked.html # Halaman blokir permanen
│   ├── captcha.html         # Halaman captcha
│   └── js_challenge.html    # (opsional)
└── README.md
```

---

## Endpoint Admin & API
- **/admin/stats** — Statistik server (hanya whitelist IP)
- **/admin/monitor** — Monitoring real-time (hanya whitelist IP)
- **/admin/blocklist/add** — Tambah IP ke blocklist (POST, ip=...)
- **/admin/blocklist/remove** — Hapus IP dari blocklist (POST, ip=...)
- **/admin/whitelist/add** — Tambah IP ke whitelist (POST, ip=...)
- **/admin/whitelist/remove** — Hapus IP dari whitelist (POST, ip=...)
- **/admin/blocklist/export** — Download blocklist (GET)
- **/admin/blocklist/import** — Import blocklist (POST, raw JSON array)

---

## Fitur Lain
- **Block Sementara & Permanent**: Spam >10x/5 detik → blokir 10 detik, 3x/24 jam → permanent block.
- **Captcha**: User bisa unblock sendiri jika lolos captcha.
- **Rate Limiting**: Per-IP, per-endpoint, per-token, per-path.
- **GeoIP & User-Agent Filtering**: Blokir negara/UA tertentu.
- **Pattern Analysis**: Deteksi scanning, brute force.
- **Maintenance Mode**: Aktifkan dengan mengubah `maintenance.json`.
- **Blocklist Sync**: Sinkronisasi blocklist dari sumber eksternal.
- **Export/Import Blocklist**: Backup/restore blocklist.
- **Webhook/Notifikasi**: Integrasi event penting ke file/email/webhook.

---

## Kustomisasi
- **Landing Page**: Edit `view/index.html` sesuai branding/tim kamu.
- **Halaman Blocked/Captcha**: Edit `view/blocked.html`, `view/permanent_blocked.html`, `view/captcha.html`.
- **Threshold Block**: Ubah nilai di file modul `antiddos/` (misal: `MAX_BLOCKS`, `BLOCK_TIME`, dsb).
- **Port/Host**: Ubah di variabel `port` & `hostname` di `server.js`.
- **Whitelist/Blacklist**: Edit file `whitelist.json` & `blacklisted.json` atau via endpoint admin.

---

## Kontribusi & Lisensi
- Bebas digunakan & dimodifikasi.
- Untuk kontribusi, silakan pull request atau kontak admin.

---

## Author
Protected By **R.A.S Cyber Team** 