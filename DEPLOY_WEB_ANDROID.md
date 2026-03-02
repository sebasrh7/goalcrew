# Plan de ejecución (Web + APK + Landing)

## 1. Adaptar auth para web

Ya está aplicado:
- `src/store/authStore.ts` ahora decide en runtime entre `authStore.web` y `authStore.native` usando `Platform.OS`.

## 2. Desactivar notificaciones en web

Ya está aplicado:
- `src/lib/notifications.ts` ahora decide en runtime entre `notifications.web` y `notifications.native`.
- En web se usan stubs (`src/lib/notifications.web.ts`) sin `expo-notifications`.

## 3. Generar APK para Android

Script agregado:
```bash
npm run build:apk
```

Si falla `expo run:android` por Build Tools corrupto:
1. Android Studio > SDK Manager.
2. Reinstala `Android SDK Build-Tools 36.0.0`.
3. Reintenta el comando.

## 4. Deploy del web app (gratis)

Script agregado:
```bash
npm run web:build
```

### Opción A: Vercel
- `vercel.json` ya configurado (`dist` + rewrite SPA).
- Importa el repo en Vercel y deploy automático.

### Opción B: Netlify
- `netlify.toml` ya configurado (`dist` + redirect SPA).
- Importa el repo en Netlify y deploy automático.

## 5. Landing page (APK + web app)

Archivo creado:
- `landing/index.html`

Antes de publicar, reemplaza:
- `https://goalcrew-web.vercel.app`
- `https://example.com/goalcrew.apk`

Variables de entorno sugeridas en `.env.example`:
- `EXPO_PUBLIC_WEB_APP_URL`
- `EXPO_PUBLIC_APK_URL`
