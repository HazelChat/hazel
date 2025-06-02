import { useSignIn } from "@clerk/clerk-expo"
import { Link, useRouter } from "expo-router"
import React from "react"
import { Text, TextInput, TouchableOpacity, View } from "react-native"

export default function Page() {
	const { signIn, setActive, isLoaded } = useSignIn()
	const router = useRouter()

	const [emailAddress, setEmailAddress] = React.useState("")
	const [password, setPassword] = React.useState("")

	const onSignInPress = async () => {
		if (!isLoaded) return

		try {
			const signInAttempt = await signIn.create({
				identifier: emailAddress,
				password,
			})

			if (signInAttempt.status === "complete") {
				await setActive({ session: signInAttempt.createdSessionId })
				router.replace("/")
			} else {
				console.error(JSON.stringify(signInAttempt, null, 2))
			}
		} catch (err) {
			console.error(JSON.stringify(err, null, 2))
		}
	}

	return (
		<View>
			<Text>Sign in</Text>
			<TextInput
				autoCapitalize="none"
				value={emailAddress}
				placeholder="Enter email"
				onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
			/>
			<TextInput
				value={password}
				placeholder="Enter password"
				secureTextEntry={true}
				onChangeText={(password) => setPassword(password)}
			/>
			<TouchableOpacity onPress={onSignInPress}>
				<Text>Continue</Text>
			</TouchableOpacity>
			<View style={{ display: "flex", flexDirection: "row", gap: 3 }}>
				<Text>Don't have an account?</Text>
				<Link href="/sign-up">
					<Text>Sign up</Text>
				</Link>
			</View>
		</View>
	)
}
