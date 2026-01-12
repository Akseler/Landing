# Hostinger Deployment - vol.69

## One-Sentence Launch Command

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git vol.69 && cd vol.69 && git checkout vol.69 && npm install && npm run build && export DATABASE_URL="postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" && PORT=3000 npm start
```

## With PM2 (Recommended for Production)

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git && cd YOUR_REPO && git checkout vol.69 && npm install && npm run build && export DATABASE_URL="postgresql://postgres.sirnowikpquelnzowbzp:akseler420%2A%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres" && PORT=3000 pm2 start dist/index.js --name "landing-vol69" && pm2 save
```

## Steps:

1. Add your GitHub remote: `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git`
2. Push the branch: `git push -u origin vol.69`
3. On Hostinger console, run the deployment command above


