// 🌍 Global reference para el callback de OAuth
export let onOAuthSessionCallback: ((session: any) => void) | null = null;

export function setOAuthSessionCallback(callback: (session: any) => void) {
  console.log("🔔 OAuth session callback registered");
  onOAuthSessionCallback = callback;
}

export function triggerOAuthCallback(session: any) {
  if (onOAuthSessionCallback) {
    console.log("🔔 Triggering OAuth callback with session");
    onOAuthSessionCallback(session);
  } else {
    console.warn("⚠️  No OAuth callback registered");
  }
}
