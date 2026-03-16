import { OrganizationId } from "@hazel/schema"
import { Effect, Exit, Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
	decodeInternalOrganizationId,
	normalizeWorkOSRole,
	WorkOSSyncOrganizationPayload,
} from "./workos-sync"

describe("WorkOSSync helpers", () => {
	it("decodes valid internal organization IDs from WorkOS external IDs", async () => {
		const orgId = await Effect.runPromise(
			decodeInternalOrganizationId("00000000-0000-4000-8000-000000000055"),
		)

		expect(orgId).toBe(
			"00000000-0000-4000-8000-000000000055" as Schema.Schema.Type<typeof OrganizationId>,
		)
	})

	it("fails invalid internal organization IDs", async () => {
		const exit = await Effect.runPromise(decodeInternalOrganizationId("invalid-org-id").pipe(Effect.exit))

		expect(Exit.isFailure(exit)).toBe(true)
	})

	it("defaults invalid WorkOS roles to member", async () => {
		const role = await Effect.runPromise(normalizeWorkOSRole("not-a-role"))

		expect(role).toBe("member")
	})

	it("accepts org webhook payloads with missing externalId", async () => {
		const payload = await Effect.runPromise(
			Schema.decodeUnknownEffect(WorkOSSyncOrganizationPayload)({
				id: "org_01ABC123",
				name: "Acme",
			}),
		)

		expect(payload.externalId).toBeUndefined()
	})
})
