import { ChannelMemberRepo, ChannelRepo, MessageRepo, OrganizationMemberRepo } from "@hazel/backend-core"
import { PermissionError } from "@hazel/domain"
import * as CurrentUser from "@hazel/domain/current-user"
import { type ApiScope, CurrentBotScopes, scopesForRole } from "@hazel/domain/scopes"
import type { ChannelId, MessageId, OrganizationId } from "@hazel/schema"
import { Effect, FiberRef, Option } from "effect"
import { isAdminOrOwner, type OrganizationRole } from "../lib/policy-utils"

/**
 * OrgResolver centralizes organization membership lookup + scope validation.
 * It replaces ad-hoc role checks across individual policy services with a single
 * point of scope resolution.
 */
export class OrgResolver extends Effect.Service<OrgResolver>()("OrgResolver", {
	effect: Effect.gen(function* () {
		const organizationMemberRepo = yield* OrganizationMemberRepo
		const channelRepo = yield* ChannelRepo
		const channelMemberRepo = yield* ChannelMemberRepo
		const messageRepo = yield* MessageRepo

		/**
		 * Resolves granted scopes for the current actor.
		 * For bots, uses the bot's declared scopes (mapped to ApiScope).
		 * For human users, uses role-based scopes.
		 */
		const resolveGrantedScopes = (role: "owner" | "admin" | "member") =>
			Effect.gen(function* () {
				const botScopes = yield* FiberRef.get(CurrentBotScopes)
				if (Option.isSome(botScopes)) {
					return botScopes.value
				}
				return scopesForRole(role)
			})

		/**
		 * Core scope check: looks up the actor's org membership and maps role to scopes.
		 */
		const requireScope = (
			organizationId: OrganizationId,
			scope: ApiScope,
			entity: string,
			action: string,
		) =>
			Effect.gen(function* () {
				const actor = yield* CurrentUser.Context
				const member = yield* organizationMemberRepo
					.findByOrgAndUser(organizationId, actor.id)
					.pipe(Effect.orDie)

				if (Option.isNone(member)) {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}

				const granted = yield* resolveGrantedScopes(member.value.role as "owner" | "admin" | "member")
				if (!granted.has(scope)) {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}
			})

		/**
		 * Requires admin or owner role in the organization.
		 * Used for operations like org update, managing integrations, etc.
		 */
		const requireAdminOrOwner = (
			organizationId: OrganizationId,
			scope: ApiScope,
			entity: string,
			action: string,
		) =>
			Effect.gen(function* () {
				const actor = yield* CurrentUser.Context
				const member = yield* organizationMemberRepo
					.findByOrgAndUser(organizationId, actor.id)
					.pipe(Effect.orDie)

				if (Option.isNone(member)) {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}

				if (!isAdminOrOwner(member.value.role as OrganizationRole)) {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}
			})

		/**
		 * Requires owner role in the organization.
		 */
		const requireOwner = (
			organizationId: OrganizationId,
			scope: ApiScope,
			entity: string,
			action: string,
		) =>
			Effect.gen(function* () {
				const actor = yield* CurrentUser.Context
				const member = yield* organizationMemberRepo
					.findByOrgAndUser(organizationId, actor.id)
					.pipe(Effect.orDie)

				if (Option.isNone(member) || member.value.role !== "owner") {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}
			})

		/**
		 * Check scope from an organization ID directly (any org member).
		 */
		const fromOrganization = (
			organizationId: OrganizationId,
			scope: ApiScope,
			entity: string,
			action: string,
		) => requireScope(organizationId, scope, entity, action)

		/**
		 * Check scope by resolving the channel's organization first.
		 */
		const fromChannel = (channelId: ChannelId, scope: ApiScope, entity: string, action: string) =>
			Effect.gen(function* () {
				const channel = yield* channelRepo.findById(channelId).pipe(Effect.orDie)
				if (Option.isNone(channel)) {
					return yield* Effect.fail(
						new PermissionError({ message: `Channel not found: ${channelId}` }),
					)
				}
				return yield* requireScope(channel.value.organizationId, scope, entity, action)
			})

		/**
		 * Check scope + channel-type access (public/private/direct/thread).
		 * Consolidates the duplicated channel-access logic from MessagePolicy.
		 */
		const fromChannelWithAccess = (
			channelId: ChannelId,
			scope: ApiScope,
			entity: string,
			action: string,
		) =>
			Effect.gen(function* () {
				const actor = yield* CurrentUser.Context
				const channel = yield* channelRepo.findById(channelId).pipe(Effect.orDie)
				if (Option.isNone(channel)) {
					return yield* Effect.fail(
						new PermissionError({ message: `Channel not found: ${channelId}` }),
					)
				}

				const ch = channel.value
				const orgMember = yield* organizationMemberRepo
					.findByOrgAndUser(ch.organizationId, actor.id)
					.pipe(Effect.orDie)

				if (Option.isNone(orgMember)) {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}

				const granted = yield* resolveGrantedScopes(orgMember.value.role as "owner" | "admin" | "member")
				if (!granted.has(scope)) {
					return yield* Effect.fail(PermissionError.insufficientScope(scope))
				}

				const hasAccess = yield* checkChannelAccess(ch, actor, orgMember.value)
				if (!hasAccess) {
					return yield* Effect.fail(
						new PermissionError({
							message: `You don't have access to this channel`,
							requiredScope: scope,
						}),
					)
				}
			})

		/**
		 * Check scope by resolving message -> channel -> org chain.
		 */
		const fromMessage = (messageId: MessageId, scope: ApiScope, entity: string, action: string) =>
			Effect.gen(function* () {
				const message = yield* messageRepo.findById(messageId).pipe(Effect.orDie)
				if (Option.isNone(message)) {
					return yield* Effect.fail(
						new PermissionError({ message: `Message not found: ${messageId}` }),
					)
				}
				return yield* fromChannelWithAccess(message.value.channelId, scope, entity, action)
			})

		/**
		 * Consolidated channel-type access logic.
		 * Checks whether the actor can access a channel based on its type.
		 */
		const checkChannelAccess = (
			channel: { type: string; parentChannelId?: string | null; id: string; organizationId: string },
			actor: CurrentUser.Schema,
			orgMember: { role: string },
		): Effect.Effect<boolean> =>
			Effect.gen(function* () {
				if (channel.type === "public") {
					return true
				}

				if (channel.type === "private") {
					if (isAdminOrOwner(orgMember.role as OrganizationRole)) {
						return true
					}
					const membership = yield* channelMemberRepo
						.findByChannelAndUser(channel.id as ChannelId, actor.id)
						.pipe(Effect.orDie)
					return Option.isSome(membership)
				}

				if (channel.type === "direct" || channel.type === "single") {
					const membership = yield* channelMemberRepo
						.findByChannelAndUser(channel.id as ChannelId, actor.id)
						.pipe(Effect.orDie)
					return Option.isSome(membership)
				}

				if (channel.type === "thread") {
					if (!channel.parentChannelId) {
						return false
					}
					const parentChannel = yield* channelRepo
						.findById(channel.parentChannelId as ChannelId)
						.pipe(Effect.orDie)

					if (Option.isNone(parentChannel)) {
						return false
					}

					const parent = parentChannel.value
					return yield* checkChannelAccess(parent as typeof channel, actor, orgMember)
				}

				return false
			})

		return {
			requireScope,
			requireAdminOrOwner,
			requireOwner,
			fromOrganization,
			fromChannel,
			fromChannelWithAccess,
			fromMessage,
			checkChannelAccess,
		} as const
	}),
	dependencies: [
		OrganizationMemberRepo.Default,
		ChannelRepo.Default,
		ChannelMemberRepo.Default,
		MessageRepo.Default,
	],
	accessors: true,
}) {}
