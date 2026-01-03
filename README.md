🎥 Drama Chindo

Platform streaming drama pendek vertikal (Short Drama) yang dibuat khusus untuk pasar Indonesia. Mendukung berbagai provider populer seperti Dramabox, Melolo, StarShort, dan lainnya dalam satu aplikasi terintegrasi yang ringan dan cepat.

✨ Fitur Unggulan

Multi-Provider Integration: Akses konten dari Dramabox, Melolo, StarShort, dan lainnya tanpa perlu pindah aplikasi.

Vertical Theater UI: Tampilan pemutar video vertikal 9:16 yang imersif, mirip TikTok/Reels.

AI Character Chat: Mengobrol dengan karakter dalam drama menggunakan integrasi Google Gemini AI.

Smart Search: Pencarian terintegrasi ke API provider.

Mobile First Design: Dioptimalkan sepenuhnya untuk pengalaman pengguna di smartphone.

VIP Access Unlocked: (Simulasi) Tampilan premium dengan akses ke semua episode.

🛠️ Teknologi yang Digunakan

React - Library UI utama.

Vite - Build tool yang super cepat.

Tailwind CSS - Framework CSS untuk styling cepat dan responsif.

Lucide React - Koleksi ikon yang ringan dan modern.

Google Gemini API - Untuk fitur chat dengan karakter AI.

🚀 Cara Menjalankan (Lokal)

Ikuti langkah ini untuk menjalankan proyek di komputer Anda:

Clone Repositori

git clone [https://github.com/username-anda/drama-chindo.git](https://github.com/username-anda/drama-chindo.git)
cd drama-chindo


Install Dependencies

npm install


Konfigurasi Environment Variables
Buat file .env di root folder proyek, lalu salin isi dari .env.example (jika ada) atau tambahkan:

VITE_API_TOKEN=dcd4d71fc48977fafc010cd4b5f123ef7b87c0b107567873df79a103d43a8218
VITE_GEMINI_KEY=masukan_api_key_gemini_anda_disini


Jalankan Server Development

npm run dev


Buka http://localhost:5173 di browser Anda.

📦 Cara Build untuk Production

Untuk membuat file statis yang siap di-upload ke hosting:

npm run build


File hasil build akan berada di folder dist/.

☁️ Deployment

Proyek ini sangat mudah di-deploy ke Vercel atau Netlify:

Push kode ke GitHub.

Import repository di dashboard Vercel/Netlify.

Masukkan Environment Variables (VITE_API_TOKEN, dll) di pengaturan project.

Klik Deploy.

Dibuat dengan ❤️ untuk pecinta Drama China.
