import { Effect, Exit, Schema } from "effect"
import { Command } from "foldkit"
import { load } from "foldkit/navigation"
import { AppRoute, hrefOf, signInHref } from "../../route"
import { HazelRpc } from "../../rpc"
import { Message } from "./message"

const tagsOf = (cause: { readonly reasons: ReadonlyArray<object> }) =>
	cause.reasons.flatMap((reason) =>
		"error" in reason &&
		typeof reason.error === "object" &&
		reason.error !== null &&
		"_tag" in reason.error
			? [String(reason.error._tag)]
			: [],
	)

export const FetchPreview = Command.define("FetchPreview", {
	args: { token: Schema.String },
	messages: [Message.SucceededFetchPreview, Message.FailedFetchPreview],
	execute: ({ token }) =>
		Effect.gen(function* () {
			const client = yield* HazelRpc
			const exit = yield* Effect.exit(client("invitation.preview", { token }))
			if (Exit.isSuccess(exit))
				return Message.SucceededFetchPreview({
					preview: {
						organizationName: exit.value.organizationName,
						organizationLogoUrl: exit.value.organizationLogoUrl,
						email: exit.value.email,
						status: exit.value.status,
					},
				})
			const tags = tagsOf(exit.cause)
			// A malformed token fails the payload schema, which is as good as not found.
			return Message.FailedFetchPreview({
				isNotFound: tags.includes("InvitationNotFoundError") || tags.includes("SchemaError"),
			})
		}),
})

/** Sign in, then come back to this link. */
export const RedirectToSignIn = Command.define("RedirectToInviteSignIn", {
	args: { token: Schema.String },
	messages: [Message.LeftPage],
	execute: ({ token }) =>
		load(signInHref(hrefOf(AppRoute.Invite({ token })))).pipe(Effect.as(Message.LeftPage())),
})

const acceptFailure = (tags: ReadonlyArray<string>) =>
	tags.includes("InvitationEmailMismatchError")
		? "This invitation was sent to a different email address."
		: tags.includes("InvitationUnavailableError") || tags.includes("InvitationNotFoundError")
			? "This invitation is no longer valid. Ask for a new one."
			: tags.includes("OrganizationNotFoundError")
				? "This workspace no longer exists."
				: "Couldn't accept the invitation. Please try again."

/** Joins, then a full load of the workspace so its data starts syncing. */
export const AcceptInvitation = Command.define("AcceptInvitation", {
	args: { token: Schema.String },
	messages: [Message.LeftPage, Message.FailedAccept],
	execute: ({ token }) =>
		Effect.gen(function* () {
			const client = yield* HazelRpc
			const exit = yield* Effect.exit(client("invitation.accept", { token }))
			if (Exit.isFailure(exit))
				return Message.FailedAccept({ error: acceptFailure(tagsOf(exit.cause)) })
			yield* load(exit.value.slug ? hrefOf(AppRoute.OrgHome({ orgSlug: exit.value.slug })) : "/")
			return Message.LeftPage()
		}),
})
