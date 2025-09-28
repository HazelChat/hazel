import { Schema } from "effect"

export const TransactionId = Schema.Number.pipe(Schema.brand("@Hazel/transactionId"))
export const TransactionIdFromString = Schema.NumberFromString.pipe(Schema.brand("@Hazel/transactionId"))

export const OrganizationId = Schema.UUID.pipe(Schema.brand("@HazelChat/OrganizationId")).annotations({
	description: "The ID of the organization",
	title: "Organization ID",
})

export const AuthState = Schema.Struct({
	returnTo: Schema.String,
})
