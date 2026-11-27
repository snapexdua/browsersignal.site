# Audit BrowserSignal

**27 November 2026.** Domain yang diperiksa adalah **browsersignal.site**. Bahan pemeriksaan awal adalah arsip BrowserSignal 2.0, tangkapan layar AdSense dari pemilik dan respons dari domain publik sebelum perubahan.

## Temuan sebelum disunting

- Google menampilkan verifikasi kepemilikan yang berhasil dan menandai **“Konten tanpa manfaat”**. Tangkapan layar tidak menyebut URL artikel tertentu. Temuan di bawah merupakan hasil pemeriksaan situs.
- Tujuh URL publik mengembalikan HTTP 200 dan isi responsnya cocok dengan berkas di ZIP lama. Sampelnya mencakup beranda, `/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/guides/one-website-not-loading.html`, `/tools/connection/`, dan `/journal/chrome-november-2026-release-note.html`.
- Semua 18 panduan browser menampilkan panel eksperimen dengan judul yang sama, diagram tiga tahap dan beberapa paragraf umum yang berulang. Langkah utama dan beberapa contoh tiap panduan telah membahas topik masing-masing. Bagian itulah yang menjadi dasar revisi.
- Delapan halaman alat diagnostik memberi arahan yang sama setelah tes. Misalnya, alat koneksi dan alat kamera sama-sama mengarahkan pengguna ke log tanpa menjelaskan secara spesifik apa yang harus dilakukan setelah HTTP 200 dengan isi tak terduga atau izin kamera ditolak.
- Arsip rilis Chrome memuat contoh yang dapat diperiksa, tetapi artikel November terutama menaut ke beranda feed. Rujukan langsung ke dua entri bertanggal memudahkan pembaca memeriksa kanal dan platform yang dimaksud.
- Nama Lilik Hartanti, email snapexdua@gmail.com dan ID publisher 4542287035866555 sudah cocok. Dua rujukan Apple tentang pengaturan situs dan data situs Safari juga sudah menuju dokumen yang sesuai. Kebijakan privasi lama menyebut iklan secara umum dan kini diperluas dengan penjelasan cookie vendor pihak ketiga dan tautan pilihan personalisasi.

## Hasil revisi

| Bagian | ZIP lama | Paket revisi |
| --- | ---: | ---: |
| Panduan browser | 18 | 18 dengan bagian keputusan baru per gejala |
| Panduan hosting dan domain | 0 | 8 |
| Artikel arsip rilis | 2 | 2 dengan sumber primer bertanggal |
| Alat pembaca | 10 | 12 |
| URL kanonis dalam sitemap | 42 | 53 |
| Halaman dengan satu skrip AdSense | 21 | 29 |

- Delapan panduan membahas tanggung jawab registrar, pengelola DNS dan host, domain utama dan www, perencanaan TTL, perpindahan hosting dengan email aktif, sertifikat HTTPS, tautan internal yang mengembalikan 404, respons HTML untuk permintaan CSS, serta perbandingan layanan hosting dan biaya perpanjangan.
- **Response Workbench** membaca tiga respons aktual dari berkas contoh pada situs sendiri. Alat menampilkan status, tipe media dan cuplikan badan respons. Satu sampel sengaja berupa HTML, dan satu path sengaja tidak memiliki berkas.
- **DNS Cutover Worksheet** menghitung perkiraan dua jendela cache untuk satu record DNS positif dengan asumsi yang tertulis. Perencanaan ini memakai TTL lama, TTL yang diturunkan, dan jeda sebelum perubahan alamat. Lokasi pengguna dan penyedia DNS tidak perlu dikirimkan.
- Pencarian memuat semua 26 panduan. Issue Pathfinder juga menerima kasus dari pemilik situs. Pembaca dapat mengunduh lembar perbandingan penawaran hosting sebagai berkas teks biasa.
- Skrip AdSense asinkron pada beranda dan 28 artikel memakai `ca-pub-4542287035866555` dan `crossorigin="anonymous"`. Alat, halaman administratif, spesimen dan halaman 404 tidak memuat skrip penayangan iklan.

## Pemeriksaan hasil

- Di pratinjau web, 53 URL kanonis dan tujuh sumber daya merespons dengan HTTP 200. Teks halaman, judul dan alamat kanonis sesuai dengan berkas paket. Berkas non-HTML yang diuji cocok secara byte. Permintaan terpisah untuk stylesheet yang sengaja tidak ada menghasilkan HTTP 404. Alur Issue Pathfinder untuk tautan publik yang hilang membuka panduan perbaikan yang sesuai.

- Seluruh 42 URL kanonis lama tetap tersedia dalam paket revisi. Pemeriksaan struktur menemukan 53 halaman kanonis yang dapat dijangkau dari beranda dan 1.643 kemunculan tautan internal yang memiliki tujuan. Judul, deskripsi, URL kanonis, navigasi fragmen, data artikel, URL sitemap dan file statis diperiksa.
- Tes perhitungan meliputi TTL nol, waktu persiapan nol, saat TTL sebelumnya tepat habis, TTL baru melebihi TTL lama, input negatif, kosong dan pecahan, serta batas nilai. Tes interpretasi respons meliputi CSS, HTML berkode 200, berkas hilang, respons kosong dan status kegagalan server.
- Di pratinjau browser, tiga sampel HTTP menghasilkan CSS, HTML dan respons berkas hilang. Perhitungan bawaan menghasilkan 40 menit, dan hasil dengan waktu persiapan 60 menit adalah 5 menit. Filter hosting memunculkan delapan panduan, pencarian “bare domain” tinggal satu, dan pencarian tanpa kecocokan menampilkan keadaan kosong.
- Menu seluler, halaman artikel bertabel, serta beranda diperiksa pada lebar pratinjau sempit. Beranda pada bingkai 390 piksel dan artikel bertabel pada bingkai 320 serta 768 piksel memiliki lebar isi yang sama dengan lebar viewport yang tersedia. Tombol menu membuka navigasi dan dapat ditutup dengan Escape. Fix Log berhasil menyimpan contoh lokal dan memuatnya kembali setelah penyegaran.
- Bukti pemeriksaan di atas mencakup arsip dan pratinjau. Versi produksi yang disampel pada pemeriksaan awal masih menggunakan isi ZIP lama. Status penayangan, persetujuan regional dan minat pengunjung yang sebenarnya hanya dapat diperiksa setelah deployment melalui akun dan data yang bersangkutan.

## Acuan untuk keputusan editorial

Google menyebut manfaat yang unik serta relevan, pengalaman pengguna dan navigasi yang bisa digunakan. Materi hosting dipilih karena membantu pembaca membedakan masalah browser dari kegagalan penerbitan. Contoh harga sepenuhnya ilustratif dan bisa dihitung ulang. Jumlah artikel dalam tabel merupakan inventaris paket. [Panduan kesiapan AdSense](https://support.google.com/adsense/answer/7299563?hl=id) · [Kebijakan tentang konten penayang](https://support.google.com/publisherpolicies/answer/11112688?hl=id) · [Pengungkapan privasi](https://support.google.com/adsense/answer/1348695?hl=en) · [Panduan ads.txt](https://support.google.com/adsense/answer/12171612?hl=id).
