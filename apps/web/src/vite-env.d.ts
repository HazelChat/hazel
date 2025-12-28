/// <reference types="vite/client" />

// Build-time injected constants
declare const __BUILD_TIME__: number
declare const __APP_VERSION__: string

// Vite environment variables
interface ImportMetaEnv {
	readonly VITE_BACKEND_URL: string
	readonly VITE_STREAMS_URL?: string
	readonly VITE_SIGNOZ_INGESTION_KEY?: string
	readonly VITE_OTEL_ENVIRONMENT?: string
	readonly VITE_COMMIT_SHA?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
