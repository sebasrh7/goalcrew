# Configuración de Google OAuth con Supabase

## 📋 Prerequisitos

1. Proyecto de Supabase activo
2. Cuenta de Google Cloud Platform

---

## ⚙️ Paso 1: Configurar Google Cloud Console

### 1.1 Crear proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: `GoalCrew`

### 1.2 Habilitar Google+ API

1. En el menú lateral, ve a **APIs & Services** → **Library**
2. Busca "Google+ API"
3. Haz clic en **Enable**

### 1.3 Configurar OAuth Consent Screen

1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External** (para usuarios de cualquier cuenta de Google)
3. Completa la información:
   - **App name**: GoalCrew
   - **User support email**: tu email
   - **Developer contact**: tu email
4. **Scopes**: Agrega estos scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. **Test users** (opcional): Agrega emails para testing
6. Guarda y continúa

### 1.4 Crear OAuth Client ID

1. Ve a **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth Client ID**
3. **Application type**: Web application
4. **Name**: GoalCrew Web Client
5. **Authorized redirect URIs**: Agrega esta URL de Supabase:
   ```
   https://<TU-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   Ejemplo: `https://abcdefghijk.supabase.co/auth/v1/callback`
   
   ⚠️ **IMPORTANTE**: Reemplaza `<TU-PROJECT-REF>` con el Project Reference de tu proyecto Supabase (lo encuentras en Settings → General → Reference ID)

6. Click **Create**
7. **Guarda estos valores** (los necesitarás en el siguiente paso):
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxxxxx`

---

## 🔐 Paso 2: Configurar Supabase

### 2.1 Habilitar Google Provider

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Providers**
4. Busca **Google** y haz clic en el ícono
5. **Enabled**: Activa el toggle
6. Pega los valores de Google Cloud:
   - **Client ID**: El que copiaste en el paso 1.4
   - **Client Secret**: El que copiaste en el paso 1.4
7. Click **Save**

### 2.2 Configurar Redirect URL en la app

En tu archivo `.env`, asegúrate de tener:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 📱 Paso 3: Configurar App Scheme (para redirects en app)

### 3.1 Actualizar app.json

En `app.json`, verifica que el scheme esté configurado:

```json
{
  "expo": {
    "scheme": "goalcrew",
    ...
  }
}
```

### 3.2 iOS - Configurar Associated Domains (opcional, para deep linking)

Si vas a publicar en iOS, agrega en `app.json`:

```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:goalcrew.app"
      ]
    }
  }
}
```

### 3.3 Android - Configurar Intent Filters (opcional)

Si vas a publicar en Android, agrega en `app.json`:

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "goalcrew.app",
              "pathPrefix": "/auth"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 🧪 Paso 4: Testing Local

### 4.1 Instalar dependencias

```bash
cd goalcrew
npm install
```

### 4.2 Ejecutar en desarrollo

```bash
# Expo Go
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### 4.3 Probar el flujo

1. Abre la app
2. Ve a través del onboarding
3. En la última diapositiva, presiona "Continuar con Google"
4. Se abrirá el navegador con la pantalla de Google OAuth
5. Selecciona tu cuenta de Google
6. Acepta los permisos
7. La app debería redirigir automáticamente y autenticarte

---

## ⚠️ Troubleshooting

### Error: "redirect_uri_mismatch"

**Causa**: La URL de callback en Google Cloud no coincide con la de Supabase.

**Solución**: 
1. Ve a Google Cloud Console → Credentials
2. Edita tu OAuth Client ID
3. Verifica que la **Authorized redirect URI** sea exactamente:
   ```
   https://<TU-PROJECT-REF>.supabase.co/auth/v1/callback
   ```

### El navegador se abre pero no redirige a la app

**Causa**: El scheme de la app no está configurado correctamente.

**Solución**:
1. Verifica que `app.json` tenga `"scheme": "goalcrew"`
2. Reinicia el bundler de Expo: `npm start -- --clear`
3. Vuelve a intentar

### Error: "Access blocked: This app's request is invalid"

**Causa**: El OAuth consent screen no está configurado correctamente.

**Solución**:
1. Ve a Google Cloud Console → OAuth consent screen
2. Asegúrate de que el estado sea "In production" o agrega tu email como Test User
3. Verifica que los scopes incluyan `userinfo.email` y `userinfo.profile`

### No se crea el perfil de usuario en la tabla `users`

**Causa**: El trigger de Supabase no se ejecutó o falló.

**Solución**:
1. Ve a Supabase → SQL Editor
2. Ejecuta este query para verificar:
   ```sql
   SELECT * FROM auth.users LIMIT 5;
   SELECT * FROM public.users LIMIT 5;
   ```
3. Si hay usuarios en `auth.users` pero no en `public.users`, ejecuta el trigger manualmente:
   ```sql
   SELECT public.handle_new_user();
   ```

---

## 🚀 Paso 5: Producción

### 5.1 Publish con EAS

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Configurar proyecto
eas build:configure

# Build para testing
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### 5.2 Cambiar OAuth consent screen a Production

1. Ve a Google Cloud Console → OAuth consent screen
2. Click **Publish App**
3. Confirma que quieres publicar

### 5.3 Agregar dominios de producción

Si tienes un dominio personalizado (ej: `goalcrew.app`), actualiza:

1. **Google Cloud**: Authorized redirect URIs
   ```
   https://goalcrew.app/auth/callback
   ```

2. **Supabase**: Site URL en Authentication → URL Configuration
   ```
   Site URL: https://goalcrew.app
   Redirect URLs: https://goalcrew.app/**
   ```

---

## 📝 Notas Importantes

1. **Testing en Expo Go**: El flujo OAuth funciona, pero puede tener limitaciones. Para mejor experiencia, usa un build de desarrollo con EAS.

2. **Deep Linking**: Para que los redirects funcionen perfectamente en producción, configura deep linking con tu dominio.

3. **Privacidad**: Google requiere que declares en tu Privacy Policy cómo usas los datos de Google. Ejemplo:
   > "Usamos Google OAuth únicamente para autenticación. Almacenamos tu email y nombre para personalizar tu experiencia en GoalCrew. No compartimos tu información con terceros."

4. **Rate Limits**: Google tiene límites en requests por minuto. Para apps grandes, considera implementar rate limiting en Supabase.

---

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google+ API habilitada
- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID creado con redirect URI correcta
- [ ] Client ID y Secret guardados
- [ ] Provider de Google habilitado en Supabase
- [ ] Client ID y Secret pegados en Supabase
- [ ] Variables de entorno configuradas en `.env`
- [ ] Scheme configurado en `app.json`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Flujo testeado en desarrollo
- [ ] (Producción) App publicada en OAuth consent screen
- [ ] (Producción) Deep linking configurado

---

¿Necesitas ayuda? Revisa la [documentación oficial de Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google) sobre Google OAuth.
