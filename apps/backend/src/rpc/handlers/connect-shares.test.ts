import { describe, expect, it } from "vitest"
import { Database } from "@hazel/db"
import { PermissionError } from "@hazel/domain"
import { ConnectChannelAlreadySharedError, ConnectWorkspaceNotFoundError } from "@hazel/domain/rpc"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { Effect, Option } from "effect"
import {
	assertGuestMemberAddsAllowed,
	remapGuestMountInsertConflict,
	resolveGuestOrganizationForInviteCreate,
	validateInviteAcceptanceTarget,
} from "./connect-shares"

const HOST_ORG_ID = "00000000-0000-0000-0000-000000000101" as OrganizationId
const GUEST_ORG_ID = "00000000-0000-0000-0000-000000000102" as OrganizationId
const OTHER_GUEST_ORG_ID = "00000000-0000-0000-0000-000000000103" as OrganizationId
const GUEST_CHANNEL_ID = "00000000-0000-0000-0000-000000000301" as ChannelId

describe("connect-shares helpers", () => {
	it("rejects invite creation when provided org and slug resolve to different workspaces", async () => {
		const result = await Effect.runPromise(
			resolveGuestOrganizationForInviteCreate({
				providedOrgId: GUEST_ORG_ID,
				target: { kind: "slug", value: "other-workspace" },
				findBySlug: () => Effect.succeed(Option.some({ id: OTHER_GUEST_ORG_ID })),
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)

		expect(result._tag).toBe("Left")
		if (result._tag === "Left") {
			expect(result.left).toBeInstanceOf(ConnectWorkspaceNotFoundError)
		}
	})

	it("rejects slug invite acceptance for the wrong organization", async () => {
		const result = await Effect.runPromise(
			validateInviteAcceptanceTarget({
				invite: {
					targetKind: "slug",
					targetValue: "guest-workspace",
					guestOrganizationId: GUEST_ORG_ID,
				},
				guestOrganizationId: OTHER_GUEST_ORG_ID,
				findBySlug: () => Effect.succeed(Option.some({ id: GUEST_ORG_ID })),
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)

		expect(result._tag).toBe("Left")
		if (result._tag === "Left") {
			expect(result.left).toBeInstanceOf(ConnectWorkspaceNotFoundError)
		}
	})

	it("rejects unbound email invite acceptance", async () => {
		const result = await Effect.runPromise(
			validateInviteAcceptanceTarget({
				invite: {
					targetKind: "email",
					targetValue: "guest@example.com",
					guestOrganizationId: null,
				},
				guestOrganizationId: GUEST_ORG_ID,
				findBySlug: () => Effect.succeed(Option.none()),
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)

		expect(result._tag).toBe("Left")
		if (result._tag === "Left") {
			expect(result.left).toBeInstanceOf(ConnectWorkspaceNotFoundError)
		}
	})

	it("denies guest member adds when the mount disallows them", async () => {
		const result = await Effect.runPromise(
			assertGuestMemberAddsAllowed({
				role: "guest",
				allowGuestMemberAdds: false,
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)

		expect(result._tag).toBe("Left")
		if (result._tag === "Left") {
			expect(result.left).toBeInstanceOf(PermissionError)
		}
	})

	it("allows member adds for host mounts and guest mounts with the setting enabled", async () => {
		const hostResult = await Effect.runPromise(
			assertGuestMemberAddsAllowed({
				role: "host",
				allowGuestMemberAdds: false,
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)
		const guestResult = await Effect.runPromise(
			assertGuestMemberAddsAllowed({
				role: "guest",
				allowGuestMemberAdds: true,
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)

		expect(hostResult._tag).toBe("Right")
		expect(guestResult._tag).toBe("Right")
	})

	it("remaps guest mount unique conflicts to an already-shared error", async () => {
		const result = await Effect.runPromise(
			remapGuestMountInsertConflict({
				error: new Database.DatabaseError({
					type: "unique_violation",
					cause: { constraint_name: "connect_conv_channels_conversation_org_unique" },
				}),
				guestOrganizationId: GUEST_ORG_ID,
				findExistingMount: () => Effect.succeed(Option.some({ channelId: GUEST_CHANNEL_ID })),
			}).pipe(Effect.either) as Effect.Effect<any, never, never>,
		)

		expect(result._tag).toBe("Left")
		if (result._tag === "Left") {
			expect(result.left).toBeInstanceOf(ConnectChannelAlreadySharedError)
		}
	})
})
