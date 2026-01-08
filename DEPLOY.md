# Deployment Guide - Hostinger Docker

## Reikalinga informacija

Prieš pradedant deployment, reikia šios informacijos:

1. **SSH prieiga prie Hostinger serverio**
   - SSH hostname/IP
   - SSH username
   - SSH port (dažniausiai 22)

2. **Docker setup**
   - Ar Docker įdiegtas serveryje?
   - Ar Docker Compose įdiegtas?

3. **Domenas**
   - Koks domenas bus naudojamas?
   - Ar reikia SSL sertifikato (HTTPS)?

4. **Environment variables**
   - `DATABASE_URL` arba `SUPABASE_DATABASE_URL` (jau turite)
   - `ANALYTICS_PASSWORD` (jau turite: Akseler500*)
   - `PORT` (default: 3000)

5. **Nginx reverse proxy** (jei reikia)
   - Ar reikia nginx konfigūracijos?
   - Ar turite nginx įdiegtą?

## Deployment žingsniai

### 1. Paruošti failus

Sukurti `.env` failą serveryje su reikalingais kintamaisiais:

```bash
DATABASE_URL=postgresql://postgres.sirnowikpquelnzowbzp:Akseleris2025*@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
ANALYTICS_PASSWORD=Akseler500*
PORT=3000
NODE_ENV=production
```

### 2. Build ir run su Docker

```bash
# Build Docker image
docker build -t webinar-app .

# Run container
docker run -d \
  --name webinar-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  webinar-app
```

### 3. Arba naudoti Docker Compose

```bash
# Build ir start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 4. Nginx konfigūracija (jei reikia)

Jei naudojate nginx kaip reverse proxy, sukurkite `/etc/nginx/sites-available/webinar`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Tada:
```bash
sudo ln -s /etc/nginx/sites-available/webinar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL sertifikatas (Let's Encrypt)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Troubleshooting

### Peržiūrėti logs
```bash
docker logs webinar-app
# arba
docker-compose logs -f
```

### Restart container
```bash
docker restart webinar-app
# arba
docker-compose restart
```

### Peržiūrėti container status
```bash
docker ps
```

### Ištrinti ir perbuild'inti
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Deployment checklist

- [ ] `.env` failas su visais reikalingais kintamaisiais
- [ ] Docker image sėkmingai build'intas
- [ ] Container veikia ir sveikatos patikra praeina
- [ ] Port 3000 atidarytas (jei reikia)
- [ ] Nginx konfigūruotas (jei naudojate)
- [ ] SSL sertifikatas įdiegtas (jei reikia HTTPS)
- [ ] Domenas nukreiptas į serverio IP
- [ ] Testuoti visi puslapiai ir funkcionalumas






