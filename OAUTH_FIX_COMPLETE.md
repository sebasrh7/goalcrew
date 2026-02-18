# 🔧 Instrucciones Completas - Fix OAuth

## Problema Identificado

El usuario **SÍ se crea en Supabase** pero el redirect no funciona en Expo Go porque:
1. Los tokens no se pasan correctamente en el deep link
2. No hay un listener para capturar el deep link cuando la app vuelve del navegador
3. Falta verificar la sesión existente como fallback

## Archivos a Modificar

### 1️⃣ `src/store/authStore.ts`

**Reemplaza TODO el archivo con:**

```typescript
import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types';

// Required for Google OAuth redirect
WebBrowser.maybeCompleteAuthSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async () => {
    set({ isLoading: true });
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'goalcrew',
        path: 'auth/callback'
      });

      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log('OAuth result:', result);

        if (result.type === 'success') {
          const url = result.url;
          
          const hashParams = new URLSearchParams(url.split('#')[1] || '');
          const queryParams = new URLSearchParams(url.split('?')[1] || '');
          
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

          console.log('Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;

            if (sessionData.user) {
              const profile = await fetchProfile(sessionData.user.id);
              set({ user: profile, session: sessionData.session, isAuthenticated: true });
              return;
            }
          }

          // Fallback: check if session exists in Supabase
          console.log('No tokens in URL, checking current session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (session?.user) {
            console.log('Found existing session!');
            const profile = await fetchProfile(session.user.id);
            set({ user: profile, session, isAuthenticated: true });
          } else {
            throw new Error('No se pudo obtener la sesión después de autenticar');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Autenticación cancelada');
        } else {
          throw new Error('Autenticación falló: ' + result.type);
        }
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async () => {
    return get().signIn();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    set({ user: updated });
  },
}));

export function initAuthListener() {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      useAuthStore.setState({ user: profile, session, isAuthenticated: true, isLoading: false });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      const profile = await fetchProfile(session.user.id);
      useAuthStore.setState({ user: profile, session, isAuthenticated: true });
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, session: null, isAuthenticated: false });
    }
  });
}

async function fetchProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
```

---

### 2️⃣ `app/(auth)/welcome.tsx`

**Cambio 1 - Agregar import de supabase (línea 9):**

```typescript
import { supabase } from '../../src/lib/supabase';
```

**Cambio 2 - Reemplazar la función `goNext` (alrededor de línea 35):**

```typescript
  const goNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        console.log('Starting Google Sign In...');
        await signIn();
        console.log('Sign in successful, navigating to tabs...');
        router.replace('/(tabs)');
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Check if user was actually created but session failed
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Session exists after error, navigating anyway...');
          router.replace('/(tabs)');
          return;
        }
        
        Alert.alert(
          'Error al iniciar sesión', 
          error.message || 'Por favor intenta de nuevo. Si el problema persiste, cierra y vuelve a abrir la app.',
          [
            { text: 'Reintentar', onPress: goNext },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }
    }
  };
```

---

### 3️⃣ `app/_layout.tsx`

**Reemplaza TODO el archivo con:**

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore, initAuthListener } from '../src/store/authStore';
import { supabase } from '../src/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useAuthStore();

  useEffect(() => {
    initAuthListener();

    const handleUrl = async ({ url }: { url: string }) => {
      console.log('Deep link received:', url);
      
      const hashParams = new URLSearchParams(url.split('#')[1] || '');
      const queryParams = new URLSearchParams(url.split('?')[1] || '');
      
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('Setting session from deep link...');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('Session set successfully from deep link!');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="group/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="group/join" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## 🧪 Testing después de los cambios

1. **Reinicia Expo completamente:**
   ```bash
   # Ctrl+C para detener
   npm start -- --clear
   ```

2. **Prueba el flujo:**
   - Abre la app
   - Completa el onboarding
   - Click "Continuar con Google"
   - Selecciona tu cuenta de Google
   - Observa los logs en la consola

3. **Logs que deberías ver:**
   ```
   Redirect URL: exp://192.168.1.6:8081/--/auth/callback
   Starting Google Sign In...
   OAuth result: { type: 'success', url: '...' }
   Tokens found: { accessToken: true, refreshToken: true }
   Sign in successful, navigating to tabs...
   ```

4. **Si no funciona en el primer intento:**
   - Mira los logs
   - Si ves "No tokens in URL, checking current session..."
   - Y luego "Found existing session!"
   - Significa que el fallback funcionó ✅

5. **Workaround temporal si aún falla:**
   - Después de que se cree el usuario en Supabase
   - Cierra la app completamente
   - Vuélvela a abrir
   - Debería detectar la sesión automáticamente y entrar directo al dashboard

---

## 📝 Notas Importantes

- **Expo Go** tiene limitaciones con deep linking. En un build real (EAS) funcionará mejor.
- El código ahora tiene 3 niveles de fallback:
  1. Extraer tokens del URL de redirect
  2. Verificar sesión existente en Supabase
  3. Detectar sesión al reabrir la app (via initAuthListener)

- Si persiste el problema, considera usar **EAS Build** para testing:
  ```bash
  eas build --platform android --profile preview
  ```

---

¿Funcionó? Si sigue habiendo problemas, compárteme los logs completos de la consola cuando intentas hacer login.
