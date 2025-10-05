# Aventura Financiera (Niños) — curso, juegos, retos, puntuación y récords

¡Lista para desplegar en Render! Incluye:
- **backend/** Flask + SQLAlchemy (API REST)
- **frontend/** React + Vite (SPA)
- `render.yaml` para desplegar **dos servicios** (backend web y sitio estático).

## Desarrollo local

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
export FLASK_APP=main.py
python main.py
# API en http://localhost:5000
```

### Frontend
```bash
cd frontend
npm i
cp .env.example .env  # asegúrate de que VITE_API_BASE apunte al backend (http://localhost:5000)
npm run dev
# App en http://localhost:5173
```

## Despliegue en Render
1. Sube este repo a GitHub.
2. En Render, **New +** → **Blueprint** → selecciona este repo.
3. Render leerá `render.yaml` y creará:
   - `aventura-financiera-backend` (Python web service)
   - `aventura-financiera-frontend` (Static Site)
4. En el Static Site, configura la variable `VITE_API_BASE` con la URL del backend (por ejemplo, `https://<tu-backend>.onrender.com`). Vuelve a desplegar.
5. (Opcional) Usa Postgres: agrega un add-on y establece `DATABASE_URL` en el servicio backend.

## Endpoints clave
- `GET /api/game/modules` — lista de módulos
- `POST /api/auth/register` — registra alumno (genera NIP)
- `GET /api/auth/login/<nip>` — login con NIP
- `POST /api/game/complete-module/<user_id>/<module_id>` — completa un módulo y guarda puntaje
- `GET /api/game/highscores` — top 10

## Notas
- Por defecto usa SQLite. Para producción, usa Postgres (Render) configurando `DATABASE_URL`.
- Estructura pensada para crecer (más módulos, mini‑juegos, badges).

¡Éxitos con la Aventura Financiera! 🏴‍☠️


## Novedades
- **Intro en video por módulo**: coloca tus MP4 en `frontend/src/assets/videos` usando nombres `modX_intro.mp4`.
- **Mini-juego Drag & Drop (Módulo 2)**: clasifica Ingresos vs Gastos, suma puntos.
- **Tienda (Shop)**: gasta monedas en cosméticos (`/api/game/shop/*`), inventario persistente.
- **Panel del Maestro**: `/api/game/teacher/overview` con promedios y Top 10.

