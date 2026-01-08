# Greitas Supabase Setup (2 min)

## 1. Gaukite Connection String

1. Supabase Dashboard → **Settings** → **Database**
2. Scroll down iki **"Connection string"**
3. Pasirinkite **"URI"** tab
4. Nukopijuokite connection string (formatas: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`)

## 2. Gaukite Password

Jei connection string turi `[YOUR-PASSWORD]`:
- Settings → Database → **Database Settings**
- Spauskite **"Reset Database Password"**
- Nukopijuokite naują password

## 3. Nustatykite .env

Atidarykite `.env` failą ir pakeiskite `[YOUR_PASSWORD]` į tikrą password:

```bash
DATABASE_URL=postgresql://postgres:JŪSŲ_TIKRAS_PASSWORD@db.sirnowikpquelnzowbzp.supabase.co:5432/postgres
```

## 4. Paleiskite (1 komanda)

```bash
npm run db:push
```

Tai automatiškai sukurs visas 6 lenteles! ✅

## 5. Patikrinkite

```bash
npm run dev
```

Console turėtų rodyti: "Database connection successful"

---

**Arba** jei norite, kad aš padaryčiau - tiesiog pateikite connection string su password čia, ir aš viską padarysiu.

