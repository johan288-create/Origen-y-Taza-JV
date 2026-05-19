# Despliegue — Origen y Taza JV

## Resumen

| Parte | Dónde | Gratis (con límites) |
|-------|--------|----------------------|
| Frontend (React) | **Vercel** o Netlify | Sí |
| API (Express) | **Render** o Railway | Sí (puede dormir) |
| Base de datos | **Neon** / **Supabase** / Render Postgres | Sí |

No se sube automáticamente: tú conectas el repo en cada plataforma.

---

## 1. Base de datos (PostgreSQL)

Crea una base en [Neon](https://neon.tech) o Render Postgres. Anota:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

Importa tu esquema/tablas existentes (las que ya usas en local).

---

## 2. Backend en Render

1. Sube el proyecto a **GitHub**.
2. En [render.com](https://render.com) → **New** → **Blueprint** (o Web Service manual).
3. Si usas el archivo `render.yaml` de la raíz, Render crea el servicio `origen-taza-api`.
4. Variables de entorno (obligatorias):

   ```
   PORT=10000
   JWT_SECRET=una-clave-larga-segura
   DB_HOST=...
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=...
   CORS_ORIGINS=https://TU-FRONT.vercel.app
   ```

5. Deploy. La URL será algo como: `https://origen-taza-api.onrender.com`

6. Prueba: `https://origen-taza-api.onrender.com/api/mapa/cafeterias`

---

## 3. Frontend en Vercel

**Tutorial detallado paso a paso:** [`docs/TUTORIAL_VERCEL.md`](./TUTORIAL_VERCEL.md)

1. [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `build`
5. **Environment Variables:**

   ```
   REACT_APP_API_URL=https://origen-taza-api.onrender.com
   ```

   (Sin `/api` al final también vale; `config.js` lo normaliza.)

6. Deploy. URL: `https://tu-proyecto.vercel.app`

7. Vuelve a Render y pon en `CORS_ORIGINS` exactamente esa URL de Vercel.

---

## 4. PWA en producción

- El service worker solo se registra con `NODE_ENV=production` (build de Vercel).
- En el móvil: menú del navegador → **Añadir a pantalla de inicio**.

---

## 5. QR en producción

Sustituye `http://localhost:3000` por tu dominio Vercel:

- Menú: `https://tu-app.vercel.app/cafeteria/{qr_token}`
- Entrada: `https://tu-app.vercel.app/qr/entrada/{qr_token}`
- Maps: `https://tu-app.vercel.app/qr/mapa/{id}`
- Taza: `https://tu-app.vercel.app/taza/{qr_vaso_token}`

---

## Local (desarrollo)

```powershell
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start
```

Abre http://localhost:3000
