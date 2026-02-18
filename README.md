# GoalCrew 🏖️

**Ahorra en grupo, viaja juntos.** App móvil de ahorro grupal con gamificación para cumplir metas antes de una fecha.

---

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React Native + Expo (SDK 51) |
| Routing | Expo Router (file-based) |
| Backend | Supabase (Auth + DB + Realtime) |
| Estado global | Zustand |
| Animaciones | React Native Reanimated |
| Build/Deploy | Expo EAS |

---

## 📁 Estructura del proyecto

```
goalcrew/
├── app/                          # Expo Router - rutas como archivos
│   ├── _layout.tsx               # Root layout + auth guard
│   ├── index.tsx                 # Redirect inicial
│   ├── (auth)/                   # Rutas sin autenticar
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx           # Onboarding (3 slides)
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                   # Rutas con bottom tab nav
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # 🏠 Home — mis metas
│   │   ├── create.tsx            # ➕ Crear meta grupal
│   │   └── profile.tsx           # 👤 Perfil + medallas
│   └── group/
│       ├── [id].tsx              # 👥 Vista del grupo (principal)
│       └── join.tsx              # 🔗 Unirse por código
│
├── src/
│   ├── components/
│   │   ├── UI.tsx                # Button, Card, Avatar, ProgressBar, etc.
│   │   ├── GroupCard.tsx         # Tarjeta de meta en el home
│   │   ├── MemberRow.tsx         # Fila de miembro (members + ranking)
│   │   └── AchievementModal.tsx  # Modal animado de medalla
│   ├── store/
│   │   ├── authStore.ts          # Zustand: auth state
│   │   ├── groupsStore.ts        # Zustand: grupos + stats calculadas
│   │   └── contributionsStore.ts # Zustand: aportes + lógica de achievements
│   ├── lib/
│   │   └── supabase.ts           # Cliente Supabase + todas las queries
│   ├── types/
│   │   └── index.ts              # Todos los tipos TypeScript
│   └── constants/
│       └── index.ts              # Colores, spacing, achievements config
│
├── supabase-schema.sql           # Schema completo de BD
├── app.json                      # Config Expo
├── tsconfig.json
└── .env.example
```

---

## ⚡ Instalación rápida

### 1. Clonar y configurar

```bash
git clone https://github.com/tu-usuario/goalcrew
cd goalcrew
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. Base de datos Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Pega y ejecuta el contenido de `supabase-schema.sql`
4. Activa **Realtime** en tu tabla `contributions` y `group_members`

### 4. Configurar Google OAuth

**Lee la guía completa:** [`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md)

Pasos resumidos:
1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilita Google+ API
3. Configura OAuth consent screen
4. Crea OAuth Client ID
5. Copia Client ID y Secret
6. Ve a Supabase → Authentication → Providers → Google
7. Pega Client ID y Secret
8. Guarda

### 5. Ejecutar

```bash
# Expo Go (desarrollo rápido)
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

---

## 🎮 Features del MVP

### ✅ Autenticación
- **Google OAuth** con Supabase (sin email/password)
- Session persistente via AsyncStorage
- Perfil con nombre y avatar (extraído de Google)

### ✅ Crear meta grupal
- Nombre, emoji, fecha límite, meta por persona
- Frecuencia: diaria / semanal / mensual
- División: igual / personalizada
- **Cálculo automático** de ahorro por periodo

### ✅ Sistema de grupo
- Crear grupo → generar código de invitación único
- Unirse por código
- Ver todos los miembros con su progreso
- Estado por miembro: 🟢 Al día / 🟡 En riesgo / 🔴 Atrasado

### ✅ Registro de aportes
- Modal con monto libre o atajos rápidos ($25, $50, $75, $100)
- Nota opcional
- Actualización en tiempo real via Supabase Realtime

### ✅ Dashboard grupal
- Anillo de progreso SVG (% global)
- Barra de progreso individual
- Cálculo de cuánto falta ahorrar por periodo
- Historial de aportes del grupo

### ✅ Gamificación
- **Sistema de puntos**: base (monto × 0.25) + bono por racha (+5)
- **Rachas (streaks)**: días consecutivos con aporte
- **Ranking semanal** por puntos
- **9 medallas desbloqueables** con modal de celebración animado

### ✅ Perfil
- Stats: total ahorrado, puntos, medallas
- Visualización de racha semanal
- Grid de medallas (ganadas / por ganar)

---

## 🗺️ Roadmap post-MVP

### v1.1 — Notificaciones
- [ ] Push notifications con Expo Notifications
- [ ] Recordatorio diario/semanal según frecuencia
- [ ] Notificación cuando alguien del grupo ahorra

### v1.2 — Social
- [ ] Comentarios en aportes
- [ ] Reacciones (emojis) a aportes
- [ ] Foto de perfil

### v1.3 — Integración de pagos
- [ ] Integración con Stripe Connect
- [ ] Wallet grupal real
- [ ] Historial de transacciones verificadas

### v2.0 — Premium
- [ ] Estadísticas avanzadas
- [ ] Modo "viaje sorpresa"
- [ ] Marketplace de experiencias
- [ ] Integración con agencias de viaje

---

## 🏗️ Decisiones de arquitectura

### ¿Por qué Expo Router en lugar de React Navigation directo?
- File-based routing = menos boilerplate
- Deep linking automático
- Mejor TypeScript support con `typedRoutes`

### ¿Por qué Zustand en lugar de Redux/Context?
- Menos boilerplate que Redux
- Más potente que Context para estado complejo
- Devtools disponibles
- Fácil de integrar con async/Supabase

### ¿Por qué la lógica de achievements en el cliente?
- Para el MVP es suficiente y más rápido de implementar
- En producción: mover a Supabase Edge Functions para mayor seguridad y consistencia

---

## 🧪 Testing

```bash
# Instalar testing tools
npm install --save-dev jest @testing-library/react-native

# Ejecutar tests
npm test
```

### Pruebas recomendadas para MVP:
1. `authStore` — sign in / sign out / persist session
2. `groupsStore` — create group / join / compute stats
3. `contributionsStore` — add contribution / calculate points / unlock achievements
4. Components — `GroupCard`, `MemberRow`, `AchievementModal`

---

## 📦 Build para producción

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Configurar proyecto
eas build:configure

# Build preview (para testear en dispositivo)
npm run build:preview

# Build production
npm run build:production
```

---

## 🤝 Contribuir

1. Fork el repo
2. Crea tu branch: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'Add: nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

---

## 📄 Licencia

MIT © GoalCrew 2025
