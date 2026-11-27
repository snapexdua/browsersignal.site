# Mengunggah revisi BrowserSignal

Paket ini berisi situs statis berbahasa Inggris untuk **browsersignal.site**. Kontak publiknya **Lilik Hartanti** di **snapexdua@gmail.com**. Hasil pemeriksaan sebelum dan sesudah revisi tersedia di `AUDIT.md`.

## GitHub dan Vercel

1. Ekstrak ZIP di komputer. Unggah **isi hasil ekstraksi** ke direktori situs dalam repositori GitHub yang sudah terhubung ke proyek Vercel BrowserSignal. Pada struktur bawaan, `index.html`, `vercel.json`, `ads.txt`, `robots.txt`, `sitemap.xml`, dan folder `hosting` sejajar di root. Sertakan file `.vercelignore` yang menyertai paket. Simpan perubahan sebagai commit agar versi sebelumnya bisa dipulihkan.
2. Gunakan proyek dan domain produksi yang selama ini melayani BrowserSignal. Untuk repositori khusus situs ini dengan konfigurasi statis bawaan, gunakan preset **Other**, root repositori dan tanpa perintah build. Berkas HTML, CSS dan JavaScript sudah siap disajikan. Jika repositori menempatkan situs dalam subfolder, Root Directory harus menunjuk ke folder yang memuat `index.html`.
3. Setelah deployment produksi selesai, buka beranda pada domain publik. Judul utamanya sekarang **Why did this page break?**. Pastikan menu **Hosting & domains** membuka delapan panduan, dan panduan lama yang sudah dibagikan masih terbuka pada alamat semula. Pembaruan ini dapat dirilis pada proyek lama tanpa mengganti registrar atau nameserver.
4. Pastikan URL produksi dapat dibuka tanpa masuk ke akun. Pengaturan proteksi preview bisa berbeda dari produksi. Periksa font, navigasi seluler dan satu tautan langsung ke artikel di tab baru.

## Pemeriksaan setelah versi baru tayang

| Alamat atau tindakan | Hasil yang dicari |
| --- | --- |
| `https://browsersignal.site/hosting/` | Direktori **Hosting & domains** terbuka dan setiap kelompok topik memiliki artikel. |
| `https://browsersignal.site/guides/one-website-not-loading.html` | Panduan lama masih tersedia dan memuat bagian **Separate a broken page from a broken hostname**. |
| `https://browsersignal.site/ads.txt` | HTTP 200 dengan teks `google.com, pub-4542287035866555, DIRECT, f08c47fec0942fa0`. |
| `https://browsersignal.site/robots.txt` dan `/sitemap.xml` | Robots menunjuk ke sitemap domain produksi. Sitemap XML memuat 53 alamat kanonis. |
| `https://browsersignal.site/tools/response-workbench/` | Tombol memuat sampel CSS, sampel HTML dan satu berkas yang memang tidak tersedia. Pada konfigurasi bawaan, statusnya berurutan 200, 200 dan 404. |
| `https://browsersignal.site/tools/dns-cutover/` | Masukan bawaan 3.600, 300 dan 20 menghasilkan 40 menit. Mengubah waktu persiapan menjadi 60 menit menghasilkan 5 menit. |
| Buka satu alamat acak yang belum dipublikasikan | Server mengembalikan HTTP 404. Pastikan tidak ada aturan yang mengarahkan semua permintaan ke beranda dengan HTTP 200. |
| `/author/`, `/contact.html`, `/privacy.html` | Nama, alamat email, penjelasan data dan pilihan iklan dapat ditemukan oleh pembaca. |

## Pengajuan ulang AdSense

- Di akun AdSense yang bersangkutan, periksa **Sites** untuk domain dan publisher yang benar. Pesan penolakan yang dikirim menyebut *Konten tanpa manfaat*. Hanya akun pemilik yang dapat menunjukkan status peninjauan, pengenalan ads.txt dan masalah kebijakan terbaru.
- Periksa pengaturan **Privacy & messaging** yang berlaku bagi pengunjung situs. Untuk iklan personal kepada pengunjung di Wilayah Ekonomi Eropa, Inggris Raya dan Swiss, Google mensyaratkan CMP tersertifikasi Google yang terintegrasi dengan IAB TCF. Jika menggunakan pesan Google, hubungkan dengan situs ini, publikasikan dan verifikasi pada wilayah yang relevan. Kebijakan privasi situs menjelaskan pemakaian data dan pilihan personalisasi. [Panduan Google untuk CMP](https://support.google.com/adsense/answer/13554116?hl=id).
- Setelah versi produksi dapat diakses, buka **Sites → browsersignal.site** dan gunakan **Minta peninjauan** sesuai tampilan akun. Jika menggunakan Search Console, inspeksi beranda dan satu panduan hosting baru untuk melihat akses crawl serta kirim sitemap yang diperbarui. Search Console dapat membantu diagnosis.
- Setelah publikasi, gunakan pertanyaan pembaca, laporan masalah dan data Search Console yang benar-benar tersedia untuk memilih perbaikan berikutnya. Tanggal “revised” pada artikel sebaiknya mengikuti perubahan isi yang nyata. Penilaian kualitas dan persetujuan berada pada Google. [Panduan kesiapan halaman AdSense](https://support.google.com/adsense/answer/7299563?hl=id).

## Menjalankan pemeriksaan paket

Kedua perintah berikut dijalankan dari folder hasil ekstraksi.

```sh
python3 checks/verify.py
node checks/owner-tools.test.cjs
```

Pemeriksaan tidak memerlukan instalasi paket tambahan. Untuk melihat halaman pada komputer sendiri, jalankan `python3 -m http.server 8000` dari folder yang sama dan buka `http://localhost:8000/`. Alamat berbasis HTTP lokal mendukung navigasi yang mengacu ke root situs. Vercel memiliki konfigurasi produksi sendiri untuk mengirim halaman 404.
