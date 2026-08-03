# DraShort Ready-to-Run

## Cara tercepat di VPS

1. Upload dan ekstrak folder ini.
2. Masuk ke folder project.
3. Jalankan:

```bash
chmod +x install.sh
./install.sh
```

Website akan tersedia di:

```text
http://IP-VPS:8080
```

## Mengganti port

```bash
cp .env.example .env
nano .env
```

Ubah:

```env
APP_PORT=8080
```

Lalu:

```bash
docker compose up -d --build
```

## Menggunakan domain melalui Nginx host

Contoh:

```nginx
server {
    server_name drama.domainkamu.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Setelah itu pasang SSL:

```bash
certbot --nginx -d drama.domainkamu.com
```

## Perintah penting

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

## Update tampilan

Ganti `index.html`, kemudian jalankan:

```bash
./update.sh
```

Versi ini masih memakai data demo dan belum menaruh token API di browser.
