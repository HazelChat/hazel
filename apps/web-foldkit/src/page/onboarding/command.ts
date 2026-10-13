import { OrganizationId, OrganizationMemberId, UserId } from "@hazel/schema"
import { Duration, Effect, Exit, Schema } from "effect"
import { Command } from "foldkit"
import { load, replaceUrl } from "foldkit/navigation"
import { failureToast } from "../../data/actions"
import { HazelRpc } from "../../rpc"
import { sendInvitations } from "../../data/invitations"
import { Message } from "./message"

export const ReadBrowserTimezone = Command.define("ReadBrowserTimezone", {
	messages: [Message.DetectedBrowserTimezone],
	execute:
		Effect.sync(() =>
			Message.DetectedBrowserTimezone({ browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
		),
})

/** `navigate({ search: (prev) => ({ ...prev, step }), replace: true })`, the href from `onboardingHref`. */
export const ReplaceOnboardingStepUrl = Command.define("ReplaceOnboardingStepUrl", {
	args: { href: Schema.String },
	messages: [Message.CompletedReplaceStepUrl],
	execute: ({ href }) => replaceUrl(href).pipe(Effect.as(Message.CompletedReplaceStepUrl())),
})

/** The profile step's name, through `user.update`. */
export const UpdateProfile = Command.define("UpdateProfile", {
	args: { userId: UserId, firstName: Schema.String, lastName: Schema.String },
	messages: [Message.SucceededUpdateProfile, Message.FailedUpdateProfile],
	execute: ({ userId, firstName, lastName }) =>
		Effect.gen(function* () {
			const client = yield* HazelRpc
			yield* client("user.update", { id: userId, firstName, lastName })
			return Message.SucceededUpdateProfile()
		}).pipe(Effect.catch(() => Effect.succeed(Message.FailedUpdateProfile()))),
})

export const DebounceTimezoneQuery = Command.define("DebounceTimezoneQuery", {
	args: { query: Schema.String },
	messages: [Message.ElapsedTimezoneDebounce],
	execute: ({ query }) =>
		Effect.sleep(Duration.millis(150)).pipe(Effect.as(Message.ElapsedTimezoneDebounce({ query }))),
})

export const UpdateUserTimezone = Command.define("UpdateUserTimezone", {
	args: { userId: UserId, timezone: Schema.String },
	messages: [Message.SucceededUpdateTimezone, Message.FailedUpdateTimezone],
	execute: ({ userId, timezone }) =>
		Effect.gen(function* () {
			const client = yield* HazelRpc
			const exit = yield* Effect.exit(client("user.update", { id: userId, timezone }))
			if (Exit.isSuccess(exit)) return Message.SucceededUpdateTimezone({ timezone })
			return Message.FailedUpdateTimezone({
				toast: failureToast(exit.cause, "friendly", {
					UserNotFoundError: {
						title: "User not found",
						description: "Your account could not be found. Please try signing in again.",
					},
				}),
			})
		}),
})

/** Invites each address to the user's organization as a member. */
export const SendInvites = Command.define("SendInvites", {
	args: { organizationId: Schema.NullOr(OrganizationId), emails: Schema.Array(Schema.String) },
	messages: [Message.SucceededSendInvites, Message.FailedSendInvites],
	execute: ({ organizationId, emails }) =>
		organizationId === null
			? Effect.succeed(Message.FailedSendInvites({ reason: "NoOrganization" }))
			: sendInvitations(
					organizationId,
					emails.map((email) => ({ email, role: "member" as const })),
				).pipe(
					Effect.map(({ errorCount }) =>
						errorCount === emails.length
							? Message.FailedSendInvites({ reason: "AllFailed" })
							: Message.SucceededSendInvites({ emails, failedCount: errorCount }),
					),
				),
})

/** `handleFinalization`: finalize first (critical), then the best-effort metadata. */
export const CompleteOnboarding = Command.define("CompleteOnboarding", {
	args: {
		memberId: Schema.NullOr(OrganizationMemberId),
		role: Schema.NullOr(Schema.String),
		useCases: Schema.Array(Schema.String),
	},
	messages: [Message.SucceededCompleteOnboarding, Message.FailedCompleteOnboarding],
	execute: ({ memberId, role, useCases }) =>
		Effect.gen(function* () {
			const client = yield* HazelRpc
			const finalized = yield* Effect.exit(client("user.finalizeOnboarding", undefined))
			if (Exit.isFailure(finalized))
				return Message.FailedCompleteOnboarding({ error: "Failed to finalize onboarding" })
			if (memberId !== null)
				yield* client("organizationMember.updateMetadata", {
					id: memberId,
					metadata: { ...(role === null ? {} : { role }), useCases },
				}).pipe(Effect.ignore)
			return Message.SucceededCompleteOnboarding()
		}),
})

/** A full reload, so a cached `user.me` can't bounce the user back here. */
export const LoadOnboardingHome = Command.define("LoadOnboardingHome", {
	args: { href: Schema.String },
	messages: [Message.CompletedLoadHome],
	execute: ({ href }) => load(href).pipe(Effect.as(Message.CompletedLoadHome())),
})
