import { and, Database, eq, isNull, ModelRepository, or, schema, type TxFn } from "@hazel/db"
import type { ConnectInviteId, OrganizationId } from "@hazel/schema"
import { ConnectInvite } from "@hazel/domain/models"
import { ServiceMap, Effect, Option } from "effect"

export class ConnectInviteRepo extends ServiceMap.Service<ConnectInviteRepo>()("ConnectInviteRepo", {
	make: Effect.gen(function* () {
		const baseRepo = yield* ModelRepository.makeRepository(
			schema.connectInvitesTable,
			ConnectInvite.Model,
			{
				idColumn: "id",
				name: "ConnectInvite",
			},
		)
		const db = yield* Database.Database

		const findActiveById = (id: ConnectInviteId, tx?: TxFn) =>
			db
				.makeQuery((execute, input: ConnectInviteId) =>
					execute((client) =>
						client
							.select()
							.from(schema.connectInvitesTable)
							.where(
								and(
									eq(schema.connectInvitesTable.id, input),
									isNull(schema.connectInvitesTable.deletedAt),
								),
							)
							.limit(1),
					),
				)(id, tx)
				.pipe(Effect.map((results) => Option.fromNullable(results[0])))

		const listIncomingForOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery((execute, input: OrganizationId) =>
				execute((client) =>
					client
						.select()
						.from(schema.connectInvitesTable)
						.where(
							and(
								eq(schema.connectInvitesTable.guestOrganizationId, input),
								isNull(schema.connectInvitesTable.deletedAt),
							),
						),
				),
			)(organizationId, tx)

		const listOutgoingForOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery((execute, input: OrganizationId) =>
				execute((client) =>
					client
						.select()
						.from(schema.connectInvitesTable)
						.where(
							and(
								eq(schema.connectInvitesTable.hostOrganizationId, input),
								isNull(schema.connectInvitesTable.deletedAt),
							),
						),
				),
			)(organizationId, tx)

		const findPendingForGuestOrganization = (organizationId: OrganizationId, tx?: TxFn) =>
			db.makeQuery((execute, input: OrganizationId) =>
				execute((client) =>
					client
						.select()
						.from(schema.connectInvitesTable)
						.where(
							and(
								eq(schema.connectInvitesTable.status, "pending"),
								isNull(schema.connectInvitesTable.deletedAt),
								or(
									eq(schema.connectInvitesTable.guestOrganizationId, input),
									eq(schema.connectInvitesTable.targetKind, "email"),
								),
							),
						),
				),
			)(organizationId, tx)

		return {
			...baseRepo,
			findActiveById,
			listIncomingForOrganization,
			listOutgoingForOrganization,
			findPendingForGuestOrganization,
		}
	}),
}) {}
