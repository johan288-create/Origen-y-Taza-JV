# Tutorial: subir Origen y Taza JV a Vercel

Guía paso a paso para publicar **solo el frontend** (React) en Vercel.  
La API (Express) y la base de datos van en otro servicio (recomendado: [Render](https://render.com) — ver `docs/DEPLOY.md`).

---

## Antes de empezar

1. **Cuenta en GitHub** con el proyecto subido (commit + push).
2. **Cuenta en Vercel** → [https://vercel.com](https://vercel.com) (puedes entrar con GitHub).
3. **API desplegada** (o al menos saber la URL que tendrá). Ejemplo:  
   `https://origen-taza-api.onrender.com`  
   Sin API en internet, la web cargará pero no podrá iniciar sesión ni pedir datos.

---

## Paso 1 — Subir el código a GitHub

En la carpeta del proyecto (`coffee-experience`):

```bash
git add .
git commit -m "Origen y Taza JV — listo para Vercel"
git push origin main
```

(Si tu rama principal se llama `master`, usa `master` en lugar de `main`.)

---

## Paso 2 — Crear el proyecto en Vercel

1. Entra a [vercel.com/dashboard](https://vercel.com/dashboard).
2. Clic en **Add New…** → **Project**.
3. **Import** el repositorio de GitHub (`coffee-experience`).
4. En la pantalla de configuración, **no uses la raíz del repo**. Ajusta:

| Campo | Valor |
|--------|--------|
| **Framework Preset** | Create React App |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

El archivo `frontend/vercel.json` ya redirige todas las rutas a `index.html` (necesario para React Router).

---

## Paso 3 — Variable de entorno (obligatoria)

En la misma pantalla (o después en **Settings → Environment Variables**):

| Nombre | Valor de ejemplo |
|--------|------------------|
| `REACT_APP_API_URL` | `https://origen-taza-api.onrender.com` |

- Puedes poner la URL **con** o **sin** `/api` al final; el proyecto la normaliza en `frontend/src/config.js`.
- Marca **Production** (y opcionalmente Preview si quieres probar ramas).

Clic en **Deploy**.

---

## Paso 4 — Esperar el build

- Vercel instalará dependencias y ejecutará `npm run build` dentro de `frontend/`.
- Si falla, abre **Deployments → el deploy fallido → Building** y lee el error (suele ser dependencia o variable mal escrita).
- Si termina en verde, tendrás una URL como:  
  `https://coffee-experience-xxx.vercel.app`

---

## Paso 5 — Permitir tu dominio en el backend (CORS)

En Render (o donde tengas la API), edita la variable:

```
CORS_ORIGINS=https://TU-PROYECTO.vercel.app
```

Usa la URL **exacta** que te dio Vercel (con `https`, sin barra final).  
Si tienes dominio propio, añádelo separado por coma:

```
CORS_ORIGINS=https://tu-app.vercel.app,https://www.origenytaza.com
```

Guarda y **reinicia** el servicio de la API.

---

## Paso 6 — Probar en el navegador

1. Abre la URL de Vercel.
2. Inicia sesión con un usuario que exista en tu base de datos de producción.
3. Prueba un dashboard (cliente, barista, admin, etc.).
4. En móvil: menú del navegador → **Añadir a pantalla de inicio** (PWA).

---

## Paso 7 — Dominio propio (opcional)

1. Vercel → tu proyecto → **Settings → Domains**.
2. Añade tu dominio (ej. `origenytaza.com`).
3. En tu proveedor DNS, crea los registros que indique Vercel (normalmente CNAME).
4. Actualiza `CORS_ORIGINS` en la API con el nuevo dominio.

---

## Actualizar la web después de cambios

Cada `git push` a la rama conectada vuelve a desplegar automáticamente.

O manualmente: **Deployments → Redeploy**.

---

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| Pantalla en blanco / 404 al refrescar | Confirma `frontend/vercel.json` y Root Directory = `frontend`. |
| Login o datos no cargan | Revisa `REACT_APP_API_URL` y que la API esté encendida. |
| Error CORS en consola | Añade la URL de Vercel en `CORS_ORIGINS` del backend. |
| Sigue apuntando a `localhost` | Variable `REACT_APP_API_URL` vacía o deploy sin rebuild tras cambiarla. |
| API en Render “dormida” | Primera petición tarda ~30 s; es normal en plan gratis. |

---

## Resumen rápido

```
GitHub → Vercel (root: frontend) → REACT_APP_API_URL → Deploy
→ Copiar URL Vercel → CORS_ORIGINS en Render → Probar login
```

Más detalle del backend y la base de datos: **`docs/DEPLOY.md`**.  
Funciones PWA, QR y taza inteligente: **`docs/ORIGEN_TAZA_JV.md`**.
