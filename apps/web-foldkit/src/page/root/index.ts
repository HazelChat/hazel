import { OrganizationId, UserId } from "@hazel/schema"
import { and, eq } from "@tanstack/db"
import { Effect, Option, Schema, Stream } from "effect"
import { Command, Submodel, Subscription } from "foldkit"
import { modifyFields } from "foldkit/struct"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { takeReturnTo } from "../../auth/return-to"
import { liveQueryStream } from "../../data/live-query"
import { rootRedirect } from "../../redirect"
import type { CurrentUser } from "../../session"
import { appLoader } from "../../shell/layouts"
import {
	definePage,
	type PageReturn,
	type PageSubscriptionInput,
	type PageViewInputs,
	type Shared,
} from "../contract"
import { PageOutMessage } from "../out-message"
import { Message, Model } from "./model"

/** `_app/index.tsx`: a loader that forwards to the user's org, onboarding or org selection. */

type Return = PageReturn<Model, Message>

export const TakeReturnTo = Command.define("TakeReturnTo", {
	messages: [Message.TookReturnTo],
	execute: takeReturnTo.pipe(Effect.map((returnTo) => Message.TookReturnTo({ returnTo }))),
})

/** Where to go: back to where sign-in started, unless onboarding comes first; else `rootRedirect`. */
const targetOf = (model: Model, user: CurrentUser): string =>
	model.returnTo && user.isOnboarded
		? model.returnTo
		: rootRedirect(user, Option.fromNullishOr(model.membership))

/** Redirects once the user, their membership and the remembered page are known. */
const redirectWhenReady = (model: Model, shared: Shared): Return =>
	model.hasRedirected ||
	model.membership === undefined ||
	model.returnTo === undefined ||
	shared.currentUser === null
		? { model }
		: {
				model: modifyFields(model, { hasRedirected: () => true }),
				outMessage: PageOutMessage.RequestedNavigation({
					href: targetOf(model, shared.currentUser),
					replace: true,
				}),
			}

interface MembershipRow {
	readonly org: { readonly id: OrganizationId; readonly slug?: string | null }
}

const subscriptions = Subscription.make<PageSubscriptionInput<Model>, Message>()((entry) => ({
	membership: entry(
		{ userId: Schema.NullOr(UserId), organizationId: Schema.NullOr(OrganizationId) },
		{
			modelToDependencies: ({ shared }) => ({
				userId: shared.currentUser?.id ?? null,
				organizationId: shared.currentUser?.organizationId ?? null,
			}),
			dependenciesToStream: ({ userId, organizationId }) =>
				userId === null
					? Stream.empty
					: liveQueryStream<MembershipRow, Message>(
							(q) =>
								q
									.from({ member: organizationMemberCollection })
									.innerJoin({ org: organizationCollection }, ({ member, org }) =>
										eq(member.organizationId, org.id),
									)
									// With an org in the JWT, only that membership counts.
									.where(({ member }) =>
										organizationId
											? and(
													eq(member.userId, userId),
													eq(member.organizationId, organizationId),
												)
											: eq(member.userId, userId),
									)
									.findOne(),
							(rows) => {
								const row = rows[0]
								return Message.UpdatedMembership({
									membership: row
										? { organizationId: row.org.id, slug: row.org.slug ?? null }
										: null,
								})
							},
						),
		},
	),
}))

export const init = (): Return => ({
	model: { membership: undefined, returnTo: undefined, hasRedirected: false },
	commands: [TakeReturnTo()],
})

export const update = (model: Model, message: Message, shared: Shared): Return =>
	Message.match<Return>(message, {
		UpdatedMembership: ({ membership }) =>
			redirectWhenReady(modifyFields(model, { membership: () => membership }), shared),
		TookReturnTo: ({ returnTo }) =>
			redirectWhenReady(modifyFields(model, { returnTo: () => returnTo }), shared),
	})

export const page = definePage(
	"Root",
	{ Model, Message },
	{
		routes: ["Root"],
		init,
		update,
		view: Submodel.defineView<Model, Message, PageViewInputs>((_model, _inputs, h) => appLoader(h)),
		subscriptions,
		sharedChanged: redirectWhenReady,
	},
)
