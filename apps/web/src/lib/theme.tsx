import { createContext, createSignal, onMount, type ParentProps, useContext } from "solid-js"

export type Theme = "light" | "dark"

interface ThemeContextValue {
	theme: () => Theme
	setTheme: (theme: Theme) => void
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>()

export function applyInitialTheme() {
	if (typeof window === "undefined") return
	const stored = localStorage.getItem("theme") as Theme | null
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
	const initial = stored ?? (prefersDark ? "dark" : "light")
	document.body.classList.toggle("dark", initial === "dark")
}

export const ThemeProvider = (props: ParentProps) => {
	const [theme, setTheme] = createSignal<Theme>("light")

	onMount(() => {
		if (typeof window === "undefined") return
		const stored = localStorage.getItem("theme") as Theme | null
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
		const initial = stored ?? (prefersDark ? "dark" : "light")
		setTheme(initial)
		document.body.classList.toggle("dark", initial === "dark")
	})

	const applyTheme = (next: Theme) => {
		setTheme(next)
		if (typeof window !== "undefined") {
			document.body.classList.toggle("dark", next === "dark")
			localStorage.setItem("theme", next)
		}
	}

	const toggleTheme = () => {
		applyTheme(theme() === "dark" ? "light" : "dark")
	}

	const ctx: ThemeContextValue = {
		theme,
		setTheme: applyTheme,
		toggleTheme,
	}

	return <ThemeContext.Provider value={ctx}>{props.children}</ThemeContext.Provider>
}

export function useTheme() {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
	return ctx
}
