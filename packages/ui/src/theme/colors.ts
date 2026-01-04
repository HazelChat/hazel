// Orange brand colors from theme.css
export const brandColors = {
	orange: {
		25: "rgb(254 250 245)",
		50: "rgb(254 246 238)",
		100: "rgb(253 234 215)",
		200: "rgb(249 219 175)",
		300: "rgb(247 178 122)",
		400: "rgb(243 135 68)",
		500: "rgb(239 104 32)",
		600: "rgb(224 79 22)",
		700: "rgb(185 56 21)",
		800: "rgb(147 47 25)",
		900: "rgb(119 41 23)",
		950: "rgb(81 28 16)",
	},
	logo: "#F46F0F",
} as const

// Fumadocs CSS variables for orange theme
export const fumadocsTheme = {
	light: {
		"--fd-primary": "224 79 22", // orange-600
		"--fd-primary-foreground": "255 255 255",
		"--fd-accent-foreground": "185 56 21", // orange-700
		"--fd-muted": "254 246 238", // orange-50
		"--fd-muted-foreground": "113 118 128",
		"--fd-background": "255 255 255",
		"--fd-foreground": "24 29 39",
		"--fd-border": "249 219 175", // orange-200
	},
	dark: {
		"--fd-background": "81 28 16", // orange-950
		"--fd-foreground": "254 246 238", // orange-50
		"--fd-card": "119 41 23", // orange-900
		"--fd-muted": "119 41 23", // orange-900
		"--fd-muted-foreground": "247 178 122", // orange-300
		"--fd-border": "147 47 25", // orange-800
		"--fd-accent-foreground": "249 219 175", // orange-200
	},
} as const
