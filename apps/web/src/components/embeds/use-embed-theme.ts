import { useAtomValue } from "@effect-atom/atom-react"
import { getBrandfetchIcon } from "~/routes/_app/$orgSlug/settings/integrations/__data"
import { resolvedThemeAtom } from "../theme-provider"

export type EmbedProvider = "linear" | "github" | "figma" | "notion" | "openstatus" | "railway"

export interface EmbedTheme {
	/** Provider display name */
	name: string
	/** Brand accent color (hex) */
	color: string
	/** Provider domain for Brandfetch */
	domain: string
	/** Logo type for Brandfetch (symbol or icon) */
	logoType?: "symbol" | "icon"
}

/**
 * Provider branding configuration for embeds.
 */
export const EMBED_THEMES: Record<EmbedProvider, EmbedTheme> = {
	linear: {
		name: "Linear",
		color: "#5E6AD2",
		domain: "linear.app",
		logoType: "icon",
	},
	github: {
		name: "GitHub",
		color: "#24292F",
		domain: "github.com",
	},
	figma: {
		name: "Figma",
		color: "#F24E1E",
		domain: "figma.com",
		logoType: "icon",
	},
	notion: {
		name: "Notion",
		color: "#000000",
		domain: "notion.so",
		logoType: "icon",
	},
	openstatus: {
		name: "OpenStatus",
		color: "#10B981",
		domain: "openstatus.dev",
		logoType: "icon",
	},
	railway: {
		name: "Railway",
		color: "#0B0D0E",
		domain: "railway.com",
		logoType: "icon",
	},
}

/**
 * Get the embed theme for a provider.
 */
export function getEmbedTheme(provider: EmbedProvider): EmbedTheme {
	return EMBED_THEMES[provider]
}

/**
 * Get the provider icon URL using Brandfetch CDN.
 */
export function getProviderIconUrl(
	provider: EmbedProvider,
	options: { size?: number; theme?: "light" | "dark" } = {},
): string {
	const { size = 64, theme = "dark" } = options
	const embedTheme = EMBED_THEMES[provider]
	return getBrandfetchIcon(embedTheme.domain, {
		size,
		theme,
		type: embedTheme.logoType,
	})
}

/**
 * Hook to get embed theming for a provider.
 * Automatically switches logo variant based on app theme for visibility.
 */
export function useEmbedTheme(provider: EmbedProvider) {
	const theme = EMBED_THEMES[provider]
	const resolvedTheme = useAtomValue(resolvedThemeAtom)

	// In dark mode, use light logo (for visibility). In light mode, use dark logo.
	const iconTheme = resolvedTheme === "dark" ? "light" : "dark"
	const iconUrl = getProviderIconUrl(provider, { theme: iconTheme })

	return {
		...theme,
		iconUrl,
	}
}
