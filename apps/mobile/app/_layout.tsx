import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { ClerkProvider } from "@clerk/clerk-expo"

import { useColorScheme } from "@/hooks/useColorScheme"

import { tokenCache } from "@clerk/clerk-expo/token-cache"

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	return (
		<ClerkProvider tokenCache={tokenCache}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack>
					<Stack.Screen name="(home)" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				<StatusBar style="auto" />
			</ThemeProvider>
		</ClerkProvider>
	)
}
