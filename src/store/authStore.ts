// Re-export for TypeScript resolution. At runtime, Metro uses
// authStore.native.ts (iOS/Android) or authStore.web.ts (web).
export { useAuthStore, initAuthListener } from "./authStore.native";
