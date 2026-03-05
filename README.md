# GoalCrew

**Ahorra en grupo, logra tus metas.** App de ahorro grupal con gamificación, disponible en Android (APK), Web y iPhone (vía Safari).

---

## Stack

| Capa        | Tecnología                            |
| ----------- | ------------------------------------- |
| Frontend    | React Native + Expo SDK 54            |
| Routing     | Expo Router 6 (file-based)            |
| Backend     | Supabase (Auth + DB + Realtime + RLS) |
| Estado      | Zustand 4                             |
| Auth        | Google OAuth (native + web)           |
| Plataformas | Android, Web, iPhone (PWA)            |
| Deploy Web  | Vercel                                |
| Build APK   | EAS Build                             |

---

## Estructura

```
goalcrew/
├── app/
│   ├── _layout.tsx               # Root layout + auth guard
│   ├── index.tsx                 # Redirect auth/tabs
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── welcome.tsx           # Onboarding carousel + Google sign-in
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab nav
│   │   ├── index.tsx             # Home — mis grupos
│   │   ├── create.tsx            # Crear grupo de ahorro
│   │   └── profile.tsx           # Perfil, rachas, logros
│   ├── group/
│   │   ├── [id].tsx              # Detalle del grupo
│   │   └── join.tsx              # Unirse por código o QR
│   └── settings.tsx              # Configuración
│
├── src/
│   ├── components/
│   │   ├── UI.tsx                # Button, Card, StatusPill, etc.
│   │   ├── GroupCard.tsx         # Tarjeta de grupo en home
│   │   ├── MemberRow.tsx         # Fila de miembro
│   │   ├── AchievementModal.tsx  # Modal de logro desbloqueado
│   │   ├── AlertModal.tsx        # Alert modal multiplataforma
│   │   ├── InviteQRModal.tsx     # QR de código de invitación
│   │   ├── LandingPage.tsx       # Landing page para web
│   │   └── ErrorBoundary.tsx     # Error boundary
│   ├── store/
│   │   ├── authStore.ts          # Auth (switch native/web)
│   │   ├── authStore.native.ts   # Google Sign-In nativo
│   │   ├── authStore.web.ts      # Google OAuth web redirect
│   │   ├── groupsStore.ts        # Grupos + stats
│   │   ├── contributionsStore.ts # Aportes + logros + rachas
│   │   └── settingsStore.ts      # Settings del usuario
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase + queries
│   │   ├── i18n.ts               # Internacionalización (es/en/fr)
│   │   ├── currency.ts           # Formato de monedas (COP/USD/EUR/MXN)
│   │   ├── haptics.ts            # Haptics wrapper (noop en web)
│   │   ├── notifications.ts      # Push notifications (noop en web)
│   │   └── oauthCallback.ts      # OAuth callback handler
│   ├── types/
│   │   └── index.ts
│   └── constants/
│       └── index.ts              # Colors, Spacing, Radius, Achievements
│
├── supabase-schema.sql           # Schema completo de BD
├── app.json                      # Config Expo
├── eas.json                      # Config EAS Build
├── vercel.json                   # Deploy web en Vercel
└── babel.config.js               # Babel + import.meta.env fix para web
```

---

## Instalación

```bash
git clone https://github.com/tu-usuario/goalcrew
cd goalcrew
npm install
```

### Variables de entorno

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Base de datos

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. SQL Editor → pega `supabase-schema.sql`
3. Activa Realtime en `contributions` y `group_members`

### Ejecutar

```bash
# Web
npm run web

# Android (requiere build nativo)
npx expo run:android

# Dev server
npm start
```

---

## Features

- **Grupos de ahorro** — Crea o únete con código/QR, meta grupal con fecha límite
- **Aportes en tiempo real** — Registro con montos rápidos, actualización vía Realtime
- **Progreso visual** — Anillo SVG, barras, porcentajes, cálculos automáticos por período
- **Gamificación** — Puntos, rachas por período, ranking semanal, 9 logros desbloqueables
- **QR de invitación** — Genera QR para compartir y escáner integrado para unirse
- **Multimoneda** — COP, USD, EUR, MXN con formato y shortcuts localizados
- **División flexible** — Igual o personalizada por miembro
- **i18n** — Español, inglés, francés
- **Multiplataforma** — Android nativo, Web (PC/Mac), iPhone vía Safari
- **Landing page** — Web landing con descarga APK y acceso a web app

---

## Deploy

### Web (Vercel)

```bash
npm i -g vercel
vercel login
vercel link
# Agregar env vars en Vercel Dashboard → Settings → Environment Variables
vercel --prod
```

### APK (Android)

```bash
npm i -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## Licencia

MIT © GoalCrew 2026
