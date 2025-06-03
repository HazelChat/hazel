import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { ClerkLoaded, ClerkLoading, ClerkProvider, useAuth } from "@clerk/clerk-expo"

import { useColorScheme } from "@/hooks/useColorScheme"

import { ConvexProviderWithClerk } from "convex/react-clerk"

import { tokenCache } from "@clerk/clerk-expo/token-cache"

import { ConvexReactClient } from "convex/react"
import { Text } from "react-native"

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
	unsavedChangesWarning: false,
})

console.log("CONVEX_URL:", process.env.EXPO_PUBLIC_CONVEX_URL)

export default function RootLayout() {
	const colorScheme = useColorScheme()
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	console.log("LOADED")

	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<ClerkLoaded>
					<Text>Loading...</Text>
					<ConvexProviderWithClerk useAuth={useAuth} client={convex}>
						<Stack>
							<Stack.Screen name="(home)" options={{ headerShown: false }} />
							<Stack.Screen name="(auth)" options={{ headerShown: false }} />
							<Stack.Screen name="+not-found" />
						</Stack>
						<StatusBar style="auto" />
					</ConvexProviderWithClerk>
				</ClerkLoaded>
				<ClerkLoading>
					<Text>Loading...</Text>
				</ClerkLoading>
			</ThemeProvider>
		</ClerkProvider>
	)
}
