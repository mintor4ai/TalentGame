# 🏗️ WFM Talent Game

Juego de simulación estratégica de Workforce Management para 4 jugadores en obras de construcción. Multijugador en tiempo real vía Supabase Realtime.

## Stack técnico

- **Frontend:** React + Vite + TailwindCSS
- **Backend / Realtime:** Supabase (gratis)
- **Deploy:** Vercel (gratis)

---

## 🚀 Guía de despliegue paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/wfm-talent-game.git
cd wfm-talent-game
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto (elige cualquier región, password segura)
3. Espera a que termine de crear (~2 min)
4. En el dashboard ve a **SQL Editor**
5. Copia y pega todo el contenido de `supabase/schema.sql`
6. Haz click en **Run** para ejecutar el schema

### 3. Copiar credenciales de Supabase

1. En el dashboard de Supabase ve a **Settings → API**
2. Copia la **Project URL** y la **anon public key**

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_clave_anon...
```

### 4. Instalar dependencias y correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Conectar a Vercel para deploy automático

1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Haz click en **Add New Project**
3. Importa el repositorio `wfm-talent-game`
4. Vercel detecta automáticamente que es un proyecto Vite

### 6. Configurar variables de entorno en Vercel

En el panel de tu proyecto en Vercel:
1. Ve a **Settings → Environment Variables**
2. Agrega:
   - `VITE_SUPABASE_URL` = tu Project URL
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
3. Haz click en **Deploy**

### 7. Compartir a los jugadores

Una vez desplegado, comparte la URL de Vercel a tus jugadores:

```
https://wfm-talent-game.vercel.app
```

O si un jugador ya creó sala, comparte el link directo:

```
https://wfm-talent-game.vercel.app/join/ALFA42
```

---

## 🎮 Cómo jugar

### Crear sala
1. Un jugador hace click en **Crear sala**
2. Escribe su nombre y elige su rol
3. Configura dificultad y modo RH
4. Comparte el código de 6 letras (o el link) al resto

### Unirse a sala
1. Los demás hacen click en **Unirme a sala**
2. Ingresan el código y eligen su nombre + rol
3. Confirman que están listos

### Durante la partida
- Cada director ve su obra y el pool de talento
- Selecciona una ficha y luego el slot destino
- Si el slot es de otra obra → llega una propuesta al otro director
- El director tiene **20 segundos** para aceptar o vetar
- Cada jugador tiene **2 vetos** disponibles
- El host puede avanzar rondas manualmente o esperar el timer

### Ganar
- Si **todas** las obras tienen ≥70% de utilidad → todos ganan
- Si no → gana el director con mayor utilidad en su obra

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── Lobby.jsx          # Sala de espera y creación de sala
│   ├── PlayerView.jsx     # Vista principal por jugador
│   ├── ObraCard.jsx       # Tarjeta de obra con slots
│   ├── TalentCard.jsx     # Ficha RPG del colaborador
│   ├── VetoDialog.jsx     # Diálogo fullscreen de negociación
│   ├── TransferFeed.jsx   # Bitácora de movimientos en tiempo real
│   ├── GanttBar.jsx       # Barras de progreso por obra
│   ├── PhaseBar.jsx       # Timer y presupuesto persistentes
│   ├── IdleBanner.jsx     # Alerta de personal ocioso
│   └── EndScreen.jsx      # Pantalla de resultados
├── hooks/
│   ├── useGameState.js    # Suscripción a Supabase Realtime
│   └── useTimer.js        # Timer con colores y callbacks
├── lib/
│   ├── supabase.js        # Cliente Supabase
│   ├── constants.js       # Constantes del juego
│   ├── gameData.js        # Talento, obras y eventos
│   └── gameLogic.js       # Scoring, utilidad, asignaciones
└── App.jsx
```

---

## 🧑‍💻 Roles disponibles

| Rol | Emoji | Obra |
|-----|-------|------|
| Director Torre Altara | 🏢 | Torre Altara |
| Director Puente Río Norte | 🌉 | Puente Río Norte |
| Director Data Center Nube9 | 🖥️ | Data Center Nube9 |
| Gerente de RH | 🤝 | Ve todas las obras |

---

## ⚙️ Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase |

---

## 📱 Compatibilidad

- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Desktop browsers
- Mobile-first design (optimizado para 390px)
