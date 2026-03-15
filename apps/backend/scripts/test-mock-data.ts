#!/usr/bin/env bun
/**
 * Test script for mock data generation endpoint
 *
 * Usage:
 * 1. Make sure the backend is running: cd apps/backendv2 && bun dev
 * 2. Run: bun run scripts/test-mock-data.ts
 */

import { Console, Effect } from "effect"

// Configuration
const API_URL = "http://localhost:3003/mock-data/generate"
const BEARER_TOKEN = "test-token-123" // This would normally come from your auth system

// Test payload
const testPayload = {
	organizationId: "550e8400-e29b-41d4-a716-446655440000", // Sample UUID
	userCount: 3,
	channelCount: 2,
	messageCount: 10,
}

/**
 * Send test request to mock data endpoint
 */
const testMockDataGeneration = Effect.gen(function* () {
	yield* Console.log("📤 Sending mock data generation request to:", API_URL)
	yield* Console.log("📦 Payload:", JSON.stringify(testPayload, null, 2))

	const response = yield* Effect.tryPromise({
		try: () =>
			fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${BEARER_TOKEN}`,
				},
				body: JSON.stringify(testPayload),
			}),
		catch: (error) => new Error(`Request failed: ${error}`),
	})

	const responseText = yield* Effect.tryPromise({
		try: () => response.text(),
		catch: () => new Error("Failed to read response"),
	})

	let responseData: unknown
	try {
		responseData = JSON.parse(responseText)
	} catch {
		responseData = responseText
	}

	yield* Console.log("\n📥 Response:")
	yield* Console.log("  Status:", response.status, response.statusText)
	yield* Console.log("  Body:", JSON.stringify(responseData, null, 2))

	if (response.ok) {
		yield* Console.log("\n✅ Mock data generation successful!")
	} else {
		yield* Console.error("\n❌ Mock data generation failed!")
	}

	return response.ok
})

/**
 * Test with missing authorization
 */
const testMissingAuth = Effect.gen(function* () {
	yield* Console.log("\n\n🧪 Testing without authorization...")

	const response = yield* Effect.tryPromise({
		try: () =>
			fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(testPayload),
			}),
		catch: (error) => new Error(`Request failed: ${error}`),
	})

	const responseText = yield* Effect.tryPromise({
		try: () => response.text(),
		catch: () => new Error("Failed to read response"),
	})

	yield* Console.log("📥 Response:")
	yield* Console.log("  Status:", response.status, response.statusText)
	yield* Console.log("  Body:", responseText)

	if (response.status === 401) {
		yield* Console.log("✅ Correctly rejected request without auth!")
	} else {
		yield* Console.error("❌ Expected 401 status for missing auth")
	}

	return response.status === 401
})

/**
 * Test with invalid payload
 */
const testInvalidPayload = Effect.gen(function* () {
	yield* Console.log("\n\n🧪 Testing with invalid payload...")

	const invalidPayload = {
		// Missing organizationId
		userCount: "not-a-number", // Wrong type
	}

	const response = yield* Effect.tryPromise({
		try: () =>
			fetch(API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${BEARER_TOKEN}`,
				},
				body: JSON.stringify(invalidPayload),
			}),
		catch: (error) => new Error(`Request failed: ${error}`),
	})

	const responseText = yield* Effect.tryPromise({
		try: () => response.text(),
		catch: () => new Error("Failed to read response"),
	})

	yield* Console.log("📥 Response:")
	yield* Console.log("  Status:", response.status, response.statusText)
	yield* Console.log("  Body:", responseText)

	if (response.status === 400) {
		yield* Console.log("✅ Correctly rejected invalid payload!")
	} else {
		yield* Console.error("❌ Expected 400 status for invalid payload")
	}

	return response.status === 400
})

// Run all tests
const runTests = Effect.gen(function* () {
	yield* Console.log("🚀 Starting mock data endpoint tests...\n")

	// Test valid request
	const validResult = yield* testMockDataGeneration

	// Test missing auth
	const authResult = yield* testMissingAuth

	// Test invalid payload
	const invalidResult = yield* testInvalidPayload

	yield* Console.log("\n\n✨ Test Results:")
	yield* Console.log("  Valid request:", validResult ? "✅" : "❌")
	yield* Console.log("  Auth check:", authResult ? "✅" : "❌")
	yield* Console.log("  Validation check:", invalidResult ? "✅" : "❌")

	if (validResult && authResult && invalidResult) {
		yield* Console.log("\n🎉 All tests passed!")
	} else {
		yield* Console.error("\n⚠️ Some tests failed")
	}
}).pipe(
	Effect.catch((error) =>
		Effect.gen(function* () {
			yield* Console.error("\n❌ Test suite error:", error)
			yield* Console.error("\n💡 Make sure the backend is running on port 3003")
		}),
	),
)

// Execute the test suite
Effect.runPromise(runTests)
