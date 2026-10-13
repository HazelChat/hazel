/// <reference types="vite/client" />
declare const __APP_VERSION__: string
interface ImportMetaEnv {
	readonly VITE_BACKEND_URL: string
	readonly VITE_ELECTRIC_URL: string
}

/**
 * clerk-js, still referenced by organization creation, invitations and profile editing until
 * those move to Hazel's own RPCs. Nothing loads it any more, so those paths find it absent.
 */
interface Window {
	Clerk?: { readonly loaded?: boolean }
}
