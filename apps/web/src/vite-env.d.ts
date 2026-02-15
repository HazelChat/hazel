/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

// Global constants injected by Vite
declare const __APP_VERSION__: string

// PrismJS language component modules (dynamically imported)
declare module "prismjs/components/prism-c"
declare module "prismjs/components/prism-cpp"
declare module "prismjs/components/prism-csharp"
declare module "prismjs/components/prism-css"
declare module "prismjs/components/prism-diff"
declare module "prismjs/components/prism-go"
declare module "prismjs/components/prism-graphql"
declare module "prismjs/components/prism-java"
declare module "prismjs/components/prism-jsx"
declare module "prismjs/components/prism-kotlin"
declare module "prismjs/components/prism-markdown"
declare module "prismjs/components/prism-php"
declare module "prismjs/components/prism-ruby"
declare module "prismjs/components/prism-rust"
declare module "prismjs/components/prism-scss"
declare module "prismjs/components/prism-sql"
declare module "prismjs/components/prism-swift"
declare module "prismjs/components/prism-tsx"
declare module "prismjs/components/prism-yaml"

// Vite environment variables
interface ImportMetaEnv {
	readonly VITE_BACKEND_URL: string
	readonly VITE_MAPLE_PUBLIC_KEY?: string
	readonly VITE_OTEL_ENVIRONMENT?: string
	readonly VITE_COMMIT_SHA?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
