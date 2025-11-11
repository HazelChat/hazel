import { Schema } from "effect"

export const TransactionId = Schema.Number.pipe(Schema.brand("@Hazel/transactionId"))
export type TransactionId = Schema.Schema.Type<typeof TransactionId>

export const TransactionIdFromString = Schema.NumberFromString.pipe(Schema.brand("@Hazel/transactionId"))
export type TransactionIdFromString = Schema.Schema.Type<typeof TransactionIdFromString>
