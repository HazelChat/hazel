import { Schema } from "effect"

export const AuthState = Schema.Struct({
	returnTo: Schema.String,
})
