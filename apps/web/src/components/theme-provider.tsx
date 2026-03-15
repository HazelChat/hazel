import { Atom, useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react"
import type { Theme as ThemeModel } from "@hazel/domain/models"
import { Schema } from "effect"
import { applyBrandColor, applyGrayPalette, applyRadius } from "~/lib/theme/apply"
import { DEFAULT_BRAND_COLOR, getDefaultThemeCustomization } from "~/lib/theme/presets"
import { platformStorageRuntime } from "~/lib/platform-storage"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
	children: React.ReactNode
	defaultTheme?: Theme
	storageKey?: string
}

const ThemeSchema = Schema.Literal("dark", "light", "system")

const HexColorSchema = Schema.String.pipe(
	Schema.pattern(/^#[0-9A-Fa-f]{6}$/),
	Schema.annotations({ message: () => "Must be a valid hex color (#RRGGBB)" }),
)

const GrayPaletteSchema = Schema.Literal(
	"gray",
	"gray-blue",
	"gray-cool",
	"gray-modern",
	"gray-neutral",
	"gray-iron",
	"gray-true",
	"gray-warm",
)

const RadiusPresetSchema = Schema.Literal("tight", "normal", "round", "full")

const ThemeCustomizationSchema = Schema.Struct({
	primary: HexColorSchema,
	grayPalette: GrayPaletteSchema,
	radius: RadiusPresetSchema,
})

// Theme mode atom with automatic localStorage persistence
export const themeAtom = Atom.kvs({
	runtime: platformStorageRuntime,
	key: "hazel-ui-theme",
	schema: Schema.NullOr(ThemeSchema),
	defaultValue: () => "system" as const,
})

// Brand color atom (legacy, kept for backward compatibility)
export const brandColorAtom = Atom.kvs({
	runtime: platformStorageRuntime,
	key: "brand-color",
	schema: Schema.NullOr(HexColorSchema),
	defaultValue: () => DEFAULT_BRAND_COLOR as string,
})

// Full theme customization atom
export const themeCustomizationAtom = Atom.kvs({
	runtime: platformStorageRuntime,
	key: "hazel-theme-customization",
	schema: Schema.NullOr(ThemeCustomizationSchema),
	defaultValue: () => getDefaultThemeCustomization() as ThemeModel.ThemeCustomization,
})

// Resolved theme (system -> light/dark)
export const resolvedThemeAtom = Atom.transform(themeAtom, (get) => {
	const theme = get(themeAtom)
	if (theme !== "system" && theme !== null) return theme

	if (typeof window === "undefined") return "light"

	// Listen to system theme changes
	const matcher = window.matchMedia("(prefers-color-scheme: dark)")

	matcher.addEventListener("change", onChange)
	get.addFinalizer(() => matcher.removeEventListener("change", onChange))

	return matcher.matches ? "dark" : "light"

	function onChange() {
		get.setSelf(matcher.matches ? "dark" : "light")
	}
})

// Apply dark/light mode to document
export const applyThemeAtom = Atom.make((get) => {
	const theme = get(resolvedThemeAtom)
	if (typeof document === "undefined") return

	const root = document.documentElement

	// Disable transitions during theme switch to prevent flash
	root.classList.add("no-transitions")

	root.classList.remove("light", "dark")
	root.classList.add(theme)

	// Re-enable transitions after the theme change has painted
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			root.classList.remove("no-transitions")
		})
	})
})

// Apply full theme customization to CSS variables
export const applyThemeCustomizationAtom = Atom.make((get) => {
	const customization = get(themeCustomizationAtom)
	const resolvedTheme = get(resolvedThemeAtom)
	if (typeof document === "undefined") return
	if (!customization) return

	const isDarkMode = resolvedTheme === "dark"

	// Apply all customization parts
	applyBrandColor(customization.primary as ThemeModel.HexColor)
	applyGrayPalette(customization.grayPalette as ThemeModel.GrayPalette, isDarkMode)
	applyRadius(customization.radius as ThemeModel.RadiusPreset)
})

// Legacy: Apply brand color from old atom (for backward compatibility)
export const applyBrandColorAtom = Atom.make((get) => {
	const brandColor = get(brandColorAtom)
	const customization = get(themeCustomizationAtom)

	// If we have a full customization, it takes precedence (handled by applyThemeCustomizationAtom)
	// Only apply legacy brand color if no customization exists
	if (customization) return

	if (typeof document === "undefined") return

	const hexColor = brandColor || DEFAULT_BRAND_COLOR
	applyBrandColor(hexColor as ThemeModel.HexColor)
})

export function ThemeProvider({ children }: ThemeProviderProps) {
	useAtomMount(applyThemeAtom)
	useAtomMount(applyThemeCustomizationAtom)
	useAtomMount(applyBrandColorAtom)

	return <>{children}</>
}

/**
 * Hook for basic theme controls (mode + brand color)
 * For full customization, use useThemeCustomization
 */
export const useTheme = () => {
	const theme = useAtomValue(themeAtom)
	const setTheme = useAtomSet(themeAtom)
	const brandColor = useAtomValue(brandColorAtom)
	const setBrandColor = useAtomSet(brandColorAtom)
	const customization = useAtomValue(themeCustomizationAtom)
	const setCustomization = useAtomSet(themeCustomizationAtom)

	// When setting brand color, also update the customization
	const handleSetBrandColor = (color: string) => {
		setBrandColor(color)
		if (customization) {
			setCustomization({
				...customization,
				primary: color,
			})
		}
	}

	return {
		theme: theme || "system",
		setTheme,
		brandColor: customization?.primary || brandColor || DEFAULT_BRAND_COLOR,
		setBrandColor: handleSetBrandColor,
	}
}

/**
 * Hook for full theme customization
 */
export const useThemeCustomization = () => {
	const customization = useAtomValue(themeCustomizationAtom)
	const setCustomization = useAtomSet(themeCustomizationAtom)
	const resolvedTheme = useAtomValue(resolvedThemeAtom)

	const activeCustomization = customization || getDefaultThemeCustomization()

	const setPrimary = (color: string) => {
		setCustomization({
			...activeCustomization,
			primary: color,
		})
	}

	const setGrayPalette = (palette: ThemeModel.GrayPalette) => {
		setCustomization({
			...activeCustomization,
			grayPalette: palette,
		})
	}

	const setRadius = (radius: ThemeModel.RadiusPreset) => {
		setCustomization({
			...activeCustomization,
			radius: radius,
		})
	}

	const setFullCustomization = (newCustomization: ThemeModel.ThemeCustomization) => {
		setCustomization(newCustomization)
	}

	return {
		customization: activeCustomization,
		isDarkMode: resolvedTheme === "dark",
		setPrimary,
		setGrayPalette,
		setRadius,
		setFullCustomization,
	}
}
