# Origen y Taza JV — integración en este repo

**Marca:** Origen y Taza JV · *Conectando historias, desde la finca hasta tu mesa*  
**Stack actual (sin reemplazar):** React (CRA) + Tailwind + Express + PostgreSQL.

## Estructura añadida

| Ruta / archivo | Rol |
|----------------|-----|
| `frontend/tailwind.config.js` | Colores `jv-*` (rosa, dorado, crema, café) + fuentes |
| `frontend/src/index.css` | Tailwind + fuentes Fraunces / Outfit |
| `frontend/public/manifest.json` | PWA: nombre, colores, standalone |
| `frontend/public/sw.js` | Service worker mínimo (solo en `production`) |
| `frontend/public/logo-origen-taza.svg` | Logo simple |
| `frontend/src/features/taza/TazaJV.jsx` | Experiencia taza: chat guía + modelo T(t) + degustación + trazabilidad |
| `frontend/src/features/qr/QrEntrada.jsx` | Alias QR → `/cafeteria/:token` |
| `frontend/src/features/qr/QrMapsRedirect.jsx` | Abre Google Maps con coordenadas de la cafetería |
| `frontend/src/App.js` | Rutas `/taza/:token`, `/qr/entrada/:token`, `/qr/mapa/:id` |
| `backend/server.js` | Tablas `cosechas` + `otj_degustacion`, semilla cafeterías, APIs |

## Tipos de QR (URLs dinámicas)

1. **Entrada / menú:** `{PUBLIC_URL}/cafeteria/{qr_token}` o `{PUBLIC_URL}/qr/entrada/{qr_token}`  
2. **Ubicación (Maps):** `{PUBLIC_URL}/qr/mapa/{id_cafetería}` → redirige a Google Maps.  
3. **Taza (por pedido):** `{PUBLIC_URL}/taza/{qr_vaso_token}` — se muestra al cliente tras confirmar pedido en menú QR; el mismo token devuelve la API `GET /api/pedidos-cafeteria/vaso/:token`.

Generación: en el mapa público y paneles de dueño ver texto con las tres URLs listas para copiar y pegar en generadores de QR (qrcode.react, `qrcode`, etc.).

## APIs nuevas

- `GET/POST /api/cafes/:id/cosechas` — varias cosechas por café (`nombre`, `anio`, `notas`).  
- `POST /api/taza/degustacion` — guarda degustación por `qr_vaso_token` (UPSERT).

## Semilla de cafeterías

Al arrancar el servidor: usuario dueño `jv.seed@origenyj.app` / contraseña `JV-Seed-2026` (solo si se crea) y hasta **8 cafeterías** listadas en el código si no existen ya por nombre.

## Marca y colores

Paleta central en `frontend/src/theme/brand.js` (rosa `#F4A9C4`, dorado `#D4AF37`, crema `#FFF3E0`, café `#4B2E2B`).

Pantallas ya actualizadas: login, registro, mapa, menú QR cafetería, cliente, café público, experiencia taza. Algunos paneles internos (barista teal, dueño azul) conservan su tema por rol.

**Despliegue paso a paso:** ver [DEPLOY.md](./DEPLOY.md).

## Despliegue (resumen)

1. **Frontend (Vercel / Netlify):** `cd frontend` → `npm install` → `npm run build`. Variable `REACT_APP_API_URL` = URL pública del API (sin barra final o con `/api` según tu `config.js`). Subcarpeta build o root según host.  
2. **Backend (Render / Railway):** `cd backend` → variables `DB_*`, `JWT_SECRET`, `PORT`, opcional `CORS_ORIGINS=https://tu-front.vercel.app`.  
3. **PWA:** instalar desde el navegador en móvil (menú “Añadir a pantalla de inicio”) tras HTTPS en producción.

## Cómo agregar cafés y cosechas

- Cafés: flujo existente (caficultor / admin).  
- Cosechas: `POST /api/cafes/{id}/cosechas` con JSON `{ "nombre": "Cosecha principal", "anio": 2026, "notas": "..." }`.
