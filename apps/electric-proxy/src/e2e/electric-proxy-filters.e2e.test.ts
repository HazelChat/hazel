import { Effect } from "effect"
import { spawn, spawnSync, type ChildProcess } from "node:child_process"
import crypto from "node:crypto"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import type { AuthenticatedUser } from "../auth/user-auth"
import { BOT_ALLOWED_TABLES, type BotAllowedTable } from "../tables/bot-tables"
import { ALLOWED_TABLES, type AllowedTable, getWhereClauseForTable } from "../tables/user-tables"
import { applyWhereToElectricUrl } from "../tables/where-clause-builder"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "../../../../")
const PROXY_DIR = path.resolve(REPO_ROOT, "apps/electric-proxy")

const PROXY_PORT = "18184"
const PROXY_BASE_URL = `http://localhost:${PROXY_PORT}`
const ELECTRIC_BASE_URL = "http://localhost:3333"
const DB_URL = "postgresql://user:password@localhost:5432/app"
const SHAPE_NONCE = crypto.randomUUID().slice(0, 12)

type ShapeMessage = {
	key?: string
	value?: Record<string, unknown>
	headers?: Record<string, unknown>
}

type ShapeFetchResult = {
	rows: Array<Record<string, unknown>>
	rawMessages: ShapeMessage[]
	handle: string | null
	offset: string | null
	status: number
}

type SyncCheckResult = {
	ok: boolean
	context: string
}

type DeltaCursor = {
	handle: string
	offset: string
}

type VisibilitySpec<TTable extends string> = {
	table: TTable
	allowedIds: string[]
	blockedIds: string[]
	strict: boolean
}

type Fixture = {
	runId: string
	viewer: AuthenticatedUser
	botToken: string
	botTokenHash: string
	noAccessBotToken: string
	noAccessBotTokenHash: string
	ids: {
		users: {
			viewer: string
			botUser: string
			otherUser: string
			deletedUser: string
			noAccessBotUser: string
			deletedBotUser: string
		}
		organizations: {
			orgA: string
			orgB: string
		}
		organizationMembers: {
			viewerOrgA: string
			botOrgA: string
			otherOrgB: string
			viewerOrgBDeleted: string
		}
		channels: {
			publicA: string
			privateA: string
			privateMemberA: string
			publicB: string
			deletedAccessibleA: string
		}
		channelMembers: {
			publicAOther: string
			privateMemberAViewer: string
			privateAOther: string
			publicBOther: string
			publicADeleted: string
		}
		channelSections: {
			orgAVisible: string
			orgBHidden: string
			orgADeleted: string
		}
		messages: {
			publicAVisible: string
			privateMemberAVisible: string
			privateAHidden: string
			publicBHidden: string
			publicADeleted: string
		}
		messageReactions: {
			publicAVisible: string
			privateAHidden: string
		}
		attachments: {
			orgAVisible: string
			orgBHidden: string
			orgADeleted: string
		}
		notifications: {
			viewerOrgAVisible: string
			otherOrgBHidden: string
			viewerDeletedMembershipHidden: string
		}
		pinnedMessages: {
			publicAVisible: string
			privateAHidden: string
		}
		typingIndicators: {
			publicAVisible: string
			privateAHidden: string
		}
		invitations: {
			orgAVisible: string
			orgBHidden: string
		}
		bots: {
			installed: string
			noAccess: string
			deleted: string
		}
		botCommands: {
			installed: string
			noAccess: string
			deletedBot: string
		}
		botInstallations: {
			installedOrgA: string
			deletedBotOrgB: string
		}
		integrationConnections: {
			orgAVisible: string
			userVisible: string
			orgBHidden: string
			otherUserHidden: string
			deletedHidden: string
		}
		customEmojis: {
			orgAVisible: string
			orgBHidden: string
			orgADeleted: string
		}
		userPresenceStatus: {
			viewer: string
			other: string
		}
	}
	values: {
		messages: {
			publicAVisible: string
			privateMemberAVisible: string
			privateAHidden: string
			publicBHidden: string
			publicADeleted: string
		}
	}
}

let fixture: Fixture
let proxyProcess: ChildProcess | undefined
let proxyLogs = ""

const runShell = (command: string, cwd = REPO_ROOT, extraEnv: Record<string, string> = {}) => {
	const result = spawnSync("bash", ["-lc", command], {
		cwd,
		env: { ...process.env, ...extraEnv },
		encoding: "utf8",
	})

	if (result.status !== 0) {
		throw new Error(
			[`Command failed: ${command}`, `exit=${String(result.status)}`, result.stdout, result.stderr]
				.filter(Boolean)
				.join("\n"),
		)
	}
}

const runSql = (sql: string) => {
	const command = `docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U user -d app <<'SQL'\n${sql}\nSQL`
	runShell(command)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const waitFor = async (
	check: () => Promise<boolean>,
	options?: { timeoutMs?: number; intervalMs?: number; name?: string },
) => {
	const timeoutMs = options?.timeoutMs ?? 30000
	const intervalMs = options?.intervalMs ?? 500
	const name = options?.name ?? "condition"
	const startedAt = Date.now()
	let lastError: unknown

	while (Date.now() - startedAt < timeoutMs) {
		try {
			if (await check()) return
		} catch (error) {
			lastError = error
		}
		await sleep(intervalMs)
	}

	throw new Error(`Timed out waiting for ${name}. Last error: ${String(lastError ?? "none")}`)
}

const parseShapeMessages = (json: unknown): ShapeMessage[] => {
	if (!Array.isArray(json)) return []
	return json
		.map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>) : undefined))
		.filter((entry): entry is Record<string, unknown> => Boolean(entry))
		.map((entry) => {
			const value =
				entry.value && typeof entry.value === "object"
					? (entry.value as Record<string, unknown>)
					: undefined
			const headers =
				entry.headers && typeof entry.headers === "object"
					? (entry.headers as Record<string, unknown>)
					: undefined
			const key = typeof entry.key === "string" ? entry.key : undefined
			return { key, value, headers }
		})
}

const parseShapeRows = (messages: ShapeMessage[]): Array<Record<string, unknown>> =>
	messages
		.map((message) => message.value)
		.filter((value): value is Record<string, unknown> => Boolean(value && typeof value === "object"))

const fetchShapeWithMeta = async (url: string, init?: RequestInit): Promise<ShapeFetchResult> => {
	const response = await fetch(url, init)
	const rawText = await response.text()
	const json = rawText.length > 0 ? JSON.parse(rawText) : []
	const rawMessages = parseShapeMessages(json)
	const rows = parseShapeRows(rawMessages)

	return {
		rows,
		rawMessages,
		handle: response.headers.get("electric-handle"),
		offset: response.headers.get("electric-offset"),
		status: response.status,
	}
}

const buildUserShapeUrl = async (
	table: AllowedTable,
	viewer: AuthenticatedUser,
	options?: { offset?: string; handle?: string; nonce?: string },
): Promise<URL> => {
	const where = await Effect.runPromise(getWhereClauseForTable(table, viewer))
	const nonce = options?.nonce ?? SHAPE_NONCE
	const nonceWhereClause = `(${where.whereClause}) AND ('${nonce}' = '${nonce}')`
	const url = new URL(`${ELECTRIC_BASE_URL}/v1/shape`)
	url.searchParams.set("table", table)
	url.searchParams.set("offset", options?.offset ?? "-1")
	if (options?.handle) {
		url.searchParams.set("handle", options.handle)
	}
	applyWhereToElectricUrl(url, { ...where, whereClause: nonceWhereClause })
	return url
}

const buildBotProxyUrl = (table: BotAllowedTable, options?: { offset?: string; handle?: string }): string => {
	const url = new URL(`${PROXY_BASE_URL}/bot/v1/shape`)
	url.searchParams.set("table", table)
	url.searchParams.set("offset", options?.offset ?? "-1")
	if (options?.handle) {
		url.searchParams.set("handle", options.handle)
	}
	return url.toString()
}

const collectIds = (rows: Array<Record<string, unknown>>, idField = "id"): string[] =>
	rows
		.map((row) => row[idField])
		.filter((value): value is string | number => typeof value === "string" || typeof value === "number")
		.map((value) => String(value))

const expectOnlyIds = (rows: Array<Record<string, unknown>>, allowedIds: string[], idField = "id") => {
	const actual = [...new Set(collectIds(rows, idField))].sort()
	const expected = [...new Set(allowedIds)].sort()
	expect(actual).toEqual(expected)
}

const expectOnlyValues = (rows: Array<Record<string, unknown>>, allowedValues: string[], field: string) => {
	const actual = [
		...new Set(
			rows
				.map((row) => row[field])
				.filter(
					(value): value is string | number =>
						typeof value === "string" || typeof value === "number",
				)
				.map((value) => String(value)),
		),
	].sort()
	const expected = [...new Set(allowedValues)].sort()
	expect(actual).toEqual(expected)
}

const getOperationsForId = (rawMessages: ShapeMessage[], id: string): string[] =>
	rawMessages
		.filter((message) => {
			if (!message.value) return false
			const valueId = message.value.id
			return (typeof valueId === "string" || typeof valueId === "number") && String(valueId) === id
		})
		.map((message) => {
			const op = message.headers?.operation
			return typeof op === "string" ? op : "unknown"
		})

const summarizeRowsById = (rows: Array<Record<string, unknown>>): string =>
	collectIds(rows).slice(0, 8).join(", ")

const waitForSyncCheck = async (options: {
	table: string
	name: string
	timeoutMs?: number
	check: () => Promise<SyncCheckResult>
}) => {
	const timeoutMs = options.timeoutMs ?? 45000
	let lastContext = "no attempts"

	try {
		await waitFor(
			async () => {
				const result = await options.check()
				lastContext = result.context
				return result.ok
			},
			{
				timeoutMs,
				intervalMs: 1000,
				name: `${options.name} (${options.table})`,
			},
		)
	} catch (error) {
		throw new Error(
			`Sync check failed for ${options.table} (${options.name}). Last context: ${lastContext}. Error: ${String(error)}`,
		)
	}
}

const fetchInitialCursor = async (table: AllowedTable): Promise<DeltaCursor> => {
	const snapshotUrl = await buildUserShapeUrl(table, fixture.viewer, { offset: "-1" })
	const snapshot = await fetchShapeWithMeta(snapshotUrl.toString())
	if (snapshot.status !== 200 || !snapshot.handle || !snapshot.offset) {
		throw new Error(
			`Failed to establish cursor for ${table}: status=${snapshot.status}, handle=${String(snapshot.handle)}, offset=${String(snapshot.offset)}`,
		)
	}
	return { handle: snapshot.handle, offset: snapshot.offset }
}

const fetchUserDeltaWithRefetch = async (
	table: AllowedTable,
	cursor: DeltaCursor,
): Promise<{ result: ShapeFetchResult; cursor: DeltaCursor; didRefetch: boolean }> => {
	const deltaUrl = await buildUserShapeUrl(table, fixture.viewer, {
		handle: cursor.handle,
		offset: cursor.offset,
	})
	const delta = await fetchShapeWithMeta(deltaUrl.toString())

	if (delta.status === 409) {
		const snapshotUrl = await buildUserShapeUrl(table, fixture.viewer, { offset: "-1" })
		const snapshot = await fetchShapeWithMeta(snapshotUrl.toString())
		if (snapshot.status !== 200 || !snapshot.handle || !snapshot.offset) {
			throw new Error(
				`409 refetch failed for ${table}: status=${snapshot.status}, handle=${String(snapshot.handle)}, offset=${String(snapshot.offset)}`,
			)
		}
		return {
			result: snapshot,
			cursor: { handle: snapshot.handle, offset: snapshot.offset },
			didRefetch: true,
		}
	}

	if (delta.status !== 200 || !delta.offset) {
		throw new Error(
			`Delta fetch failed for ${table}: status=${delta.status}, handle=${String(delta.handle)}, offset=${String(delta.offset)}`,
		)
	}

	return {
		result: delta,
		cursor: { handle: delta.handle ?? cursor.handle, offset: delta.offset },
		didRefetch: false,
	}
}

const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex")

const createFixture = (): Fixture => {
	const runId = crypto.randomUUID().slice(0, 8)
	const id = () => crypto.randomUUID()

	const ids = {
		users: {
			viewer: id(),
			botUser: id(),
			otherUser: id(),
			deletedUser: id(),
			noAccessBotUser: id(),
			deletedBotUser: id(),
		},
		organizations: {
			orgA: id(),
			orgB: id(),
		},
		organizationMembers: {
			viewerOrgA: id(),
			botOrgA: id(),
			otherOrgB: id(),
			viewerOrgBDeleted: id(),
		},
		channels: {
			publicA: id(),
			privateA: id(),
			privateMemberA: id(),
			publicB: id(),
			deletedAccessibleA: id(),
		},
		channelMembers: {
			publicAOther: id(),
			privateMemberAViewer: id(),
			privateAOther: id(),
			publicBOther: id(),
			publicADeleted: id(),
		},
		channelSections: {
			orgAVisible: id(),
			orgBHidden: id(),
			orgADeleted: id(),
		},
		messages: {
			publicAVisible: id(),
			privateMemberAVisible: id(),
			privateAHidden: id(),
			publicBHidden: id(),
			publicADeleted: id(),
		},
		messageReactions: {
			publicAVisible: id(),
			privateAHidden: id(),
		},
		attachments: {
			orgAVisible: id(),
			orgBHidden: id(),
			orgADeleted: id(),
		},
		notifications: {
			viewerOrgAVisible: id(),
			otherOrgBHidden: id(),
			viewerDeletedMembershipHidden: id(),
		},
		pinnedMessages: {
			publicAVisible: id(),
			privateAHidden: id(),
		},
		typingIndicators: {
			publicAVisible: id(),
			privateAHidden: id(),
		},
		invitations: {
			orgAVisible: id(),
			orgBHidden: id(),
		},
		bots: {
			installed: id(),
			noAccess: id(),
			deleted: id(),
		},
		botCommands: {
			installed: id(),
			noAccess: id(),
			deletedBot: id(),
		},
		botInstallations: {
			installedOrgA: id(),
			deletedBotOrgB: id(),
		},
		integrationConnections: {
			orgAVisible: id(),
			userVisible: id(),
			orgBHidden: id(),
			otherUserHidden: id(),
			deletedHidden: id(),
		},
		customEmojis: {
			orgAVisible: id(),
			orgBHidden: id(),
			orgADeleted: id(),
		},
		userPresenceStatus: {
			viewer: id(),
			other: id(),
		},
	}

	const values = {
		messages: {
			publicAVisible: `VISIBLE_PUBLIC_A_${runId}`,
			privateMemberAVisible: `VISIBLE_PRIVATE_MEMBER_A_${runId}`,
			privateAHidden: `HIDDEN_PRIVATE_A_${runId}`,
			publicBHidden: `HIDDEN_PUBLIC_B_${runId}`,
			publicADeleted: `HIDDEN_DELETED_PUBLIC_A_${runId}`,
		},
	}

	const botToken = `e2e-bot-token-${runId}-${id()}`
	const noAccessBotToken = `e2e-bot-empty-token-${runId}-${id()}`

	const viewer = {
		userId: `wrk_${ids.users.viewer}`,
		internalUserId: ids.users.viewer as AuthenticatedUser["internalUserId"],
		email: `viewer+${runId}@e2e.test`,
	} satisfies AuthenticatedUser

	return {
		runId,
		viewer,
		botToken,
		botTokenHash: hashToken(botToken),
		noAccessBotToken,
		noAccessBotTokenHash: hashToken(noAccessBotToken),
		ids,
		values,
	}
}

const seedFixture = (f: Fixture) => {
	const timestamp = Date.now()
	const sql = `
INSERT INTO users (id, "externalId", email, "firstName", "lastName", "userType", "isOnboarded", "createdAt", "updatedAt", "deletedAt")
VALUES
	('${f.ids.users.viewer}', 'wrk_e2e_viewer_${f.runId}', 'viewer+${f.runId}@e2e.test', 'Viewer', 'E2E', 'user', true, NOW(), NOW(), NULL),
	('${f.ids.users.botUser}', 'wrk_e2e_bot_${f.runId}', 'bot+${f.runId}@e2e.test', 'Bot', 'E2E', 'machine', true, NOW(), NOW(), NULL),
	('${f.ids.users.otherUser}', 'wrk_e2e_other_${f.runId}', 'other+${f.runId}@e2e.test', 'Other', 'E2E', 'user', true, NOW(), NOW(), NULL),
	('${f.ids.users.deletedUser}', 'wrk_e2e_deleted_${f.runId}', 'deleted+${f.runId}@e2e.test', 'Deleted', 'E2E', 'user', true, NOW(), NOW(), NOW()),
	('${f.ids.users.noAccessBotUser}', 'wrk_e2e_bot_empty_${f.runId}', 'bot-empty+${f.runId}@e2e.test', 'BotEmpty', 'E2E', 'machine', true, NOW(), NOW(), NULL),
	('${f.ids.users.deletedBotUser}', 'wrk_e2e_bot_deleted_${f.runId}', 'bot-deleted+${f.runId}@e2e.test', 'BotDeleted', 'E2E', 'machine', true, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO organizations (id, name, slug, "isPublic", "createdAt", "updatedAt", "deletedAt")
VALUES
	('${f.ids.organizations.orgA}', 'E2E Org A ${f.runId}', 'e2e-org-a-${f.runId}', false, NOW(), NOW(), NULL),
	('${f.ids.organizations.orgB}', 'E2E Org B ${f.runId}', 'e2e-org-b-${f.runId}', false, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_members (id, "organizationId", "userId", role, "joinedAt", "createdAt", "deletedAt")
VALUES
	('${f.ids.organizationMembers.viewerOrgA}', '${f.ids.organizations.orgA}', '${f.ids.users.viewer}', 'member', NOW(), NOW(), NULL),
	('${f.ids.organizationMembers.botOrgA}', '${f.ids.organizations.orgA}', '${f.ids.users.botUser}', 'member', NOW(), NOW(), NULL),
	('${f.ids.organizationMembers.otherOrgB}', '${f.ids.organizations.orgB}', '${f.ids.users.otherUser}', 'member', NOW(), NOW(), NULL),
	('${f.ids.organizationMembers.viewerOrgBDeleted}', '${f.ids.organizations.orgB}', '${f.ids.users.viewer}', 'member', NOW(), NOW(), NOW())
ON CONFLICT ("organizationId", "userId") DO UPDATE SET "deletedAt" = EXCLUDED."deletedAt";

INSERT INTO channel_sections (id, "organizationId", name, "order", "createdAt", "updatedAt", "deletedAt")
VALUES
	('${f.ids.channelSections.orgAVisible}', '${f.ids.organizations.orgA}', 'Visible Section ${f.runId}', 1, NOW(), NOW(), NULL),
	('${f.ids.channelSections.orgBHidden}', '${f.ids.organizations.orgB}', 'Hidden Section ${f.runId}', 1, NOW(), NOW(), NULL),
	('${f.ids.channelSections.orgADeleted}', '${f.ids.organizations.orgA}', 'Deleted Section ${f.runId}', 2, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO channels (id, name, type, "organizationId", "sectionId", "createdAt", "updatedAt", "deletedAt")
VALUES
	('${f.ids.channels.publicA}', 'e2e-public-a-${f.runId}', 'public', '${f.ids.organizations.orgA}', '${f.ids.channelSections.orgAVisible}', NOW(), NOW(), NULL),
	('${f.ids.channels.privateA}', 'e2e-private-a-${f.runId}', 'private', '${f.ids.organizations.orgA}', '${f.ids.channelSections.orgAVisible}', NOW(), NOW(), NULL),
	('${f.ids.channels.privateMemberA}', 'e2e-private-member-a-${f.runId}', 'private', '${f.ids.organizations.orgA}', '${f.ids.channelSections.orgAVisible}', NOW(), NOW(), NULL),
	('${f.ids.channels.publicB}', 'e2e-public-b-${f.runId}', 'public', '${f.ids.organizations.orgB}', '${f.ids.channelSections.orgBHidden}', NOW(), NOW(), NULL),
	('${f.ids.channels.deletedAccessibleA}', 'e2e-deleted-a-${f.runId}', 'public', '${f.ids.organizations.orgA}', '${f.ids.channelSections.orgAVisible}', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO channel_members (id, "channelId", "userId", "joinedAt", "createdAt", "deletedAt")
VALUES
	('${f.ids.channelMembers.publicAOther}', '${f.ids.channels.publicA}', '${f.ids.users.otherUser}', NOW(), NOW(), NULL),
	('${f.ids.channelMembers.privateMemberAViewer}', '${f.ids.channels.privateMemberA}', '${f.ids.users.viewer}', NOW(), NOW(), NULL),
	('${f.ids.channelMembers.privateAOther}', '${f.ids.channels.privateA}', '${f.ids.users.otherUser}', NOW(), NOW(), NULL),
	('${f.ids.channelMembers.publicBOther}', '${f.ids.channels.publicB}', '${f.ids.users.otherUser}', NOW(), NOW(), NULL),
	('${f.ids.channelMembers.publicADeleted}', '${f.ids.channels.publicA}', '${f.ids.users.viewer}', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO channel_access ("userId", "channelId", "organizationId", "createdAt", "updatedAt")
VALUES
	('${f.ids.users.viewer}', '${f.ids.channels.publicA}', '${f.ids.organizations.orgA}', NOW(), NOW()),
	('${f.ids.users.viewer}', '${f.ids.channels.privateMemberA}', '${f.ids.organizations.orgA}', NOW(), NOW()),
	('${f.ids.users.viewer}', '${f.ids.channels.deletedAccessibleA}', '${f.ids.organizations.orgA}', NOW(), NOW())
ON CONFLICT ("userId", "channelId") DO NOTHING;

INSERT INTO messages (id, "channelId", "authorId", content, "createdAt", "updatedAt", "deletedAt")
VALUES
	('${f.ids.messages.publicAVisible}', '${f.ids.channels.publicA}', '${f.ids.users.otherUser}', '${f.values.messages.publicAVisible}', NOW(), NOW(), NULL),
	('${f.ids.messages.privateMemberAVisible}', '${f.ids.channels.privateMemberA}', '${f.ids.users.otherUser}', '${f.values.messages.privateMemberAVisible}', NOW(), NOW(), NULL),
	('${f.ids.messages.privateAHidden}', '${f.ids.channels.privateA}', '${f.ids.users.otherUser}', '${f.values.messages.privateAHidden}', NOW(), NOW(), NULL),
	('${f.ids.messages.publicBHidden}', '${f.ids.channels.publicB}', '${f.ids.users.otherUser}', '${f.values.messages.publicBHidden}', NOW(), NOW(), NULL),
	('${f.ids.messages.publicADeleted}', '${f.ids.channels.publicA}', '${f.ids.users.otherUser}', '${f.values.messages.publicADeleted}', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO message_reactions (id, "messageId", "channelId", "userId", emoji, "createdAt")
VALUES
	('${f.ids.messageReactions.publicAVisible}', '${f.ids.messages.publicAVisible}', '${f.ids.channels.publicA}', '${f.ids.users.viewer}', ':thumbsup:', NOW()),
	('${f.ids.messageReactions.privateAHidden}', '${f.ids.messages.privateAHidden}', '${f.ids.channels.privateA}', '${f.ids.users.otherUser}', ':x:', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO attachments (id, "organizationId", "channelId", "messageId", "fileName", "fileSize", "uploadedBy", status, "uploadedAt", "deletedAt")
VALUES
	('${f.ids.attachments.orgAVisible}', '${f.ids.organizations.orgA}', '${f.ids.channels.publicA}', '${f.ids.messages.publicAVisible}', 'visible-${f.runId}.txt', 100, '${f.ids.users.viewer}', 'complete', NOW(), NULL),
	('${f.ids.attachments.orgBHidden}', '${f.ids.organizations.orgB}', '${f.ids.channels.publicB}', '${f.ids.messages.publicBHidden}', 'hidden-${f.runId}.txt', 200, '${f.ids.users.otherUser}', 'complete', NOW(), NULL),
	('${f.ids.attachments.orgADeleted}', '${f.ids.organizations.orgA}', '${f.ids.channels.publicA}', '${f.ids.messages.publicAVisible}', 'deleted-${f.runId}.txt', 300, '${f.ids.users.viewer}', 'failed', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, "memberId", "targetedResourceId", "targetedResourceType", "resourceId", "resourceType", "createdAt")
VALUES
	('${f.ids.notifications.viewerOrgAVisible}', '${f.ids.organizationMembers.viewerOrgA}', '${f.ids.channels.publicA}', 'channel', '${f.ids.messages.publicAVisible}', 'message', NOW()),
	('${f.ids.notifications.otherOrgBHidden}', '${f.ids.organizationMembers.otherOrgB}', '${f.ids.channels.publicB}', 'channel', '${f.ids.messages.publicBHidden}', 'message', NOW()),
	('${f.ids.notifications.viewerDeletedMembershipHidden}', '${f.ids.organizationMembers.viewerOrgBDeleted}', '${f.ids.channels.publicB}', 'channel', '${f.ids.messages.publicBHidden}', 'message', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO pinned_messages (id, "channelId", "messageId", "pinnedBy", "pinnedAt")
VALUES
	('${f.ids.pinnedMessages.publicAVisible}', '${f.ids.channels.publicA}', '${f.ids.messages.publicAVisible}', '${f.ids.users.viewer}', NOW()),
	('${f.ids.pinnedMessages.privateAHidden}', '${f.ids.channels.privateA}', '${f.ids.messages.privateAHidden}', '${f.ids.users.otherUser}', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO typing_indicators (id, "channelId", "memberId", "lastTyped")
VALUES
	('${f.ids.typingIndicators.publicAVisible}', '${f.ids.channels.publicA}', '${f.ids.channelMembers.publicAOther}', ${timestamp}),
	('${f.ids.typingIndicators.privateAHidden}', '${f.ids.channels.privateA}', '${f.ids.channelMembers.privateAOther}', ${timestamp + 1})
ON CONFLICT (id) DO NOTHING;

INSERT INTO invitations (id, "invitationUrl", "workosInvitationId", "organizationId", email, "invitedBy", "invitedAt", "expiresAt", status, "createdAt")
VALUES
	('${f.ids.invitations.orgAVisible}', 'https://example.test/invite/${f.runId}/a', 'wrk_invite_${f.runId}_a', '${f.ids.organizations.orgA}', 'invite-a+${f.runId}@e2e.test', '${f.ids.users.viewer}', NOW(), NOW() + INTERVAL '7 day', 'pending', NOW()),
	('${f.ids.invitations.orgBHidden}', 'https://example.test/invite/${f.runId}/b', 'wrk_invite_${f.runId}_b', '${f.ids.organizations.orgB}', 'invite-b+${f.runId}@e2e.test', '${f.ids.users.otherUser}', NOW(), NOW() + INTERVAL '7 day', 'pending', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO bots (id, "userId", "createdBy", name, "apiTokenHash", "isPublic", "installCount", mentionable, "createdAt", "updatedAt", "deletedAt")
VALUES
	('${f.ids.bots.installed}', '${f.ids.users.botUser}', '${f.ids.users.botUser}', 'Installed Bot ${f.runId}', '${f.botTokenHash}', false, 1, false, NOW(), NOW(), NULL),
	('${f.ids.bots.noAccess}', '${f.ids.users.noAccessBotUser}', '${f.ids.users.noAccessBotUser}', 'No Access Bot ${f.runId}', '${f.noAccessBotTokenHash}', false, 0, false, NOW(), NOW(), NULL),
	('${f.ids.bots.deleted}', '${f.ids.users.deletedBotUser}', '${f.ids.users.deletedBotUser}', 'Deleted Bot ${f.runId}', '${hashToken(`deleted-${f.runId}`)}', false, 1, false, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO bot_commands (id, "botId", name, description, "isEnabled", "createdAt", "updatedAt")
VALUES
	('${f.ids.botCommands.installed}', '${f.ids.bots.installed}', 'run-${f.runId}', 'Installed bot command ${f.runId}', true, NOW(), NOW()),
	('${f.ids.botCommands.noAccess}', '${f.ids.bots.noAccess}', 'empty-${f.runId}', 'No-access bot command ${f.runId}', true, NOW(), NOW()),
	('${f.ids.botCommands.deletedBot}', '${f.ids.bots.deleted}', 'deleted-${f.runId}', 'Deleted bot command ${f.runId}', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO bot_installations (id, "botId", "organizationId", "installedBy", "installedAt")
VALUES
	('${f.ids.botInstallations.installedOrgA}', '${f.ids.bots.installed}', '${f.ids.organizations.orgA}', '${f.ids.users.botUser}', NOW()),
	('${f.ids.botInstallations.deletedBotOrgB}', '${f.ids.bots.deleted}', '${f.ids.organizations.orgB}', '${f.ids.users.otherUser}', NOW())
ON CONFLICT ("botId", "organizationId") DO NOTHING;

INSERT INTO integration_connections (
	id,
	provider,
	"organizationId",
	"userId",
	level,
	status,
	"externalAccountId",
	"externalAccountName",
	"connectedBy",
	settings,
	metadata,
	"createdAt",
	"updatedAt",
	"deletedAt"
)
VALUES
	('${f.ids.integrationConnections.orgAVisible}', 'github', '${f.ids.organizations.orgA}', NULL, 'organization', 'active', 'org-a-${f.runId}', 'Org Visible ${f.runId}', '${f.ids.users.viewer}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NULL),
	('${f.ids.integrationConnections.userVisible}', 'linear', '${f.ids.organizations.orgA}', '${f.ids.users.viewer}', 'user', 'active', 'user-a-${f.runId}', 'User Visible ${f.runId}', '${f.ids.users.viewer}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NULL),
	('${f.ids.integrationConnections.orgBHidden}', 'figma', '${f.ids.organizations.orgB}', NULL, 'organization', 'active', 'org-b-${f.runId}', 'Org Hidden ${f.runId}', '${f.ids.users.otherUser}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NULL),
	('${f.ids.integrationConnections.otherUserHidden}', 'notion', '${f.ids.organizations.orgA}', '${f.ids.users.otherUser}', 'user', 'active', 'other-user-${f.runId}', 'Other User Hidden ${f.runId}', '${f.ids.users.otherUser}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NULL),
	('${f.ids.integrationConnections.deletedHidden}', 'discord', '${f.ids.organizations.orgA}', NULL, 'organization', 'active', 'deleted-${f.runId}', 'Deleted Hidden ${f.runId}', '${f.ids.users.viewer}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_presence_status (id, "userId", status, "updatedAt", "lastSeenAt")
VALUES
	('${f.ids.userPresenceStatus.viewer}', '${f.ids.users.viewer}', 'online', NOW(), NOW()),
	('${f.ids.userPresenceStatus.other}', '${f.ids.users.otherUser}', 'busy', NOW(), NOW())
ON CONFLICT ("userId") DO UPDATE SET status = EXCLUDED.status, "updatedAt" = NOW(), "lastSeenAt" = NOW();

INSERT INTO custom_emojis (id, "organizationId", name, "imageUrl", "createdBy", "createdAt", "deletedAt")
VALUES
	('${f.ids.customEmojis.orgAVisible}', '${f.ids.organizations.orgA}', 'visible_emoji_${f.runId}', 'https://example.test/emoji/visible.png', '${f.ids.users.viewer}', NOW(), NULL),
	('${f.ids.customEmojis.orgBHidden}', '${f.ids.organizations.orgB}', 'hidden_emoji_${f.runId}', 'https://example.test/emoji/hidden.png', '${f.ids.users.otherUser}', NOW(), NULL),
	('${f.ids.customEmojis.orgADeleted}', '${f.ids.organizations.orgA}', 'deleted_emoji_${f.runId}', 'https://example.test/emoji/deleted.png', '${f.ids.users.viewer}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
`

	runSql(sql)
}

const startProxy = async () => {
	proxyProcess = spawn("bun", ["run", "start"], {
		cwd: PROXY_DIR,
		env: {
			...process.env,
			PORT: PROXY_PORT,
			DATABASE_URL: DB_URL,
			IS_DEV: "true",
			ELECTRIC_URL: ELECTRIC_BASE_URL,
			REDIS_URL: "redis://localhost:6380",
			WORKOS_API_KEY: "sk_test_e2e",
			WORKOS_CLIENT_ID: "client_e2e",
			ALLOWED_ORIGIN: "http://localhost:3000",
		},
		stdio: ["ignore", "pipe", "pipe"],
	})

	if (proxyProcess.stdout) {
		proxyProcess.stdout.on("data", (data) => {
			proxyLogs += data.toString()
		})
	}
	if (proxyProcess.stderr) {
		proxyProcess.stderr.on("data", (data) => {
			proxyLogs += data.toString()
		})
	}

	await waitFor(
		async () => {
			const response = await fetch(`${PROXY_BASE_URL}/health`)
			return response.ok
		},
		{ timeoutMs: 45000, intervalMs: 1000, name: "proxy health endpoint" },
	)
}

const stopProxy = async () => {
	const processRef = proxyProcess
	if (!processRef || processRef.killed) return

	const exited = new Promise<void>((resolve) => {
		processRef.once("exit", () => resolve())
	})

	processRef.kill("SIGTERM")
	await Promise.race([exited, sleep(8000)])

	if (processRef.exitCode === null && processRef.signalCode === null) {
		processRef.kill("SIGKILL")
		await Promise.race([exited, sleep(2000)])
	}
}

const buildUserVisibilitySpecs = (f: Fixture): VisibilitySpec<AllowedTable>[] => [
	{
		table: "users",
		allowedIds: [
			f.ids.users.viewer,
			f.ids.users.botUser,
			f.ids.users.otherUser,
			f.ids.users.noAccessBotUser,
			f.ids.users.deletedBotUser,
		],
		blockedIds: [f.ids.users.deletedUser],
		strict: false,
	},
	{
		table: "user_presence_status",
		allowedIds: [f.ids.userPresenceStatus.viewer, f.ids.userPresenceStatus.other],
		blockedIds: [],
		strict: false,
	},
	{
		table: "organizations",
		allowedIds: [f.ids.organizations.orgA],
		blockedIds: [f.ids.organizations.orgB],
		strict: true,
	},
	{
		table: "organization_members",
		allowedIds: [f.ids.organizationMembers.viewerOrgA, f.ids.organizationMembers.botOrgA],
		blockedIds: [f.ids.organizationMembers.otherOrgB, f.ids.organizationMembers.viewerOrgBDeleted],
		strict: true,
	},
	{
		table: "channels",
		allowedIds: [f.ids.channels.publicA, f.ids.channels.privateMemberA],
		blockedIds: [f.ids.channels.privateA, f.ids.channels.publicB, f.ids.channels.deletedAccessibleA],
		strict: true,
	},
	{
		table: "channel_members",
		allowedIds: [f.ids.channelMembers.publicAOther, f.ids.channelMembers.privateMemberAViewer],
		blockedIds: [
			f.ids.channelMembers.privateAOther,
			f.ids.channelMembers.publicBOther,
			f.ids.channelMembers.publicADeleted,
		],
		strict: true,
	},
	{
		table: "channel_sections",
		allowedIds: [f.ids.channelSections.orgAVisible],
		blockedIds: [f.ids.channelSections.orgBHidden, f.ids.channelSections.orgADeleted],
		strict: true,
	},
	{
		table: "messages",
		allowedIds: [f.ids.messages.publicAVisible, f.ids.messages.privateMemberAVisible],
		blockedIds: [
			f.ids.messages.privateAHidden,
			f.ids.messages.publicBHidden,
			f.ids.messages.publicADeleted,
		],
		strict: true,
	},
	{
		table: "message_reactions",
		allowedIds: [f.ids.messageReactions.publicAVisible],
		blockedIds: [f.ids.messageReactions.privateAHidden],
		strict: true,
	},
	{
		table: "attachments",
		allowedIds: [f.ids.attachments.orgAVisible],
		blockedIds: [f.ids.attachments.orgBHidden, f.ids.attachments.orgADeleted],
		strict: true,
	},
	{
		table: "notifications",
		allowedIds: [f.ids.notifications.viewerOrgAVisible],
		blockedIds: [f.ids.notifications.otherOrgBHidden, f.ids.notifications.viewerDeletedMembershipHidden],
		strict: true,
	},
	{
		table: "pinned_messages",
		allowedIds: [f.ids.pinnedMessages.publicAVisible],
		blockedIds: [f.ids.pinnedMessages.privateAHidden],
		strict: true,
	},
	{
		table: "typing_indicators",
		allowedIds: [f.ids.typingIndicators.publicAVisible],
		blockedIds: [f.ids.typingIndicators.privateAHidden],
		strict: true,
	},
	{
		table: "invitations",
		allowedIds: [f.ids.invitations.orgAVisible],
		blockedIds: [f.ids.invitations.orgBHidden],
		strict: true,
	},
	{
		table: "bots",
		allowedIds: [f.ids.bots.installed, f.ids.bots.noAccess],
		blockedIds: [f.ids.bots.deleted],
		strict: false,
	},
	{
		table: "bot_commands",
		allowedIds: [f.ids.botCommands.installed, f.ids.botCommands.noAccess, f.ids.botCommands.deletedBot],
		blockedIds: [],
		strict: false,
	},
	{
		table: "bot_installations",
		allowedIds: [f.ids.botInstallations.installedOrgA],
		blockedIds: [f.ids.botInstallations.deletedBotOrgB],
		strict: true,
	},
	{
		table: "integration_connections",
		allowedIds: [f.ids.integrationConnections.orgAVisible, f.ids.integrationConnections.userVisible],
		blockedIds: [
			f.ids.integrationConnections.orgBHidden,
			f.ids.integrationConnections.otherUserHidden,
			f.ids.integrationConnections.deletedHidden,
		],
		strict: true,
	},
	{
		table: "custom_emojis",
		allowedIds: [f.ids.customEmojis.orgAVisible],
		blockedIds: [f.ids.customEmojis.orgBHidden, f.ids.customEmojis.orgADeleted],
		strict: true,
	},
]

const buildBotVisibilitySpecs = (f: Fixture): VisibilitySpec<BotAllowedTable>[] => [
	{
		table: "messages",
		allowedIds: [
			f.ids.messages.publicAVisible,
			f.ids.messages.privateAHidden,
			f.ids.messages.privateMemberAVisible,
		],
		blockedIds: [f.ids.messages.publicBHidden, f.ids.messages.publicADeleted],
		strict: true,
	},
	{
		table: "channels",
		allowedIds: [f.ids.channels.publicA, f.ids.channels.privateA, f.ids.channels.privateMemberA],
		blockedIds: [f.ids.channels.publicB, f.ids.channels.deletedAccessibleA],
		strict: true,
	},
	{
		table: "channel_members",
		allowedIds: [
			f.ids.channelMembers.publicAOther,
			f.ids.channelMembers.privateAOther,
			f.ids.channelMembers.privateMemberAViewer,
		],
		blockedIds: [f.ids.channelMembers.publicBOther, f.ids.channelMembers.publicADeleted],
		strict: true,
	},
]

const assertVisibilitySpec = (rows: Array<Record<string, unknown>>, spec: VisibilitySpec<string>) => {
	const ids = new Set(collectIds(rows))
	for (const id of spec.allowedIds) {
		expect(ids.has(id), `expected ${spec.table} to include ${id}`).toBe(true)
	}
	for (const id of spec.blockedIds) {
		expect(ids.has(id), `expected ${spec.table} to exclude ${id}`).toBe(false)
	}
	if (spec.strict) {
		expectOnlyIds(rows, spec.allowedIds)
	}
}

describe("electric-proxy filter E2E (real Electric)", () => {
	beforeAll(async () => {
		runShell("docker compose up -d postgres electric cache_redis")
		runShell("bun run --cwd packages/db db:push", REPO_ROOT, { DATABASE_URL: DB_URL })

		fixture = createFixture()
		seedFixture(fixture)
		await startProxy()
	}, 180000)

	afterAll(async () => {
		await stopProxy()
	}, 15000)

	it("guards that visibility specs cover every ALLOWED_TABLES entry", () => {
		const specs = buildUserVisibilitySpecs(fixture)
		const coveredTables = new Set(specs.map((spec) => spec.table))

		expect(specs).toHaveLength(ALLOWED_TABLES.length)
		for (const table of ALLOWED_TABLES) {
			expect(coveredTables.has(table), `missing spec for table ${table}`).toBe(true)
		}
	})

	it.each(ALLOWED_TABLES)(
		"applies user visibility semantics for %s",
		async (table: AllowedTable) => {
			const spec = buildUserVisibilitySpecs(fixture).find((item) => item.table === table)
			expect(spec).toBeDefined()

			const shapeUrl = await buildUserShapeUrl(table, fixture.viewer, { offset: "-1" })
			let lastRows: Array<Record<string, unknown>> = []
			let lastStatus = -1

			await waitFor(
				async () => {
					const result = await fetchShapeWithMeta(shapeUrl.toString())
					lastRows = result.rows
					lastStatus = result.status

					if (result.status !== 200) return false

					try {
						assertVisibilitySpec(result.rows, spec!)
						return true
					} catch {
						return false
					}
				},
				{
					timeoutMs: 60000,
					intervalMs: 1000,
					name: `user visibility matrix for ${table}`,
				},
			)

			assertVisibilitySpec(lastRows, spec!)
			expect(lastStatus).toBe(200)
		},
		60000,
	)

	it("verifies filtered message content values are exactly the visible ones", async () => {
		const shapeUrl = await buildUserShapeUrl("messages", fixture.viewer, { offset: "-1" })
		const result = await fetchShapeWithMeta(shapeUrl.toString())
		expect(result.status).toBe(200)
		expectOnlyValues(
			result.rows,
			[fixture.values.messages.publicAVisible, fixture.values.messages.privateMemberAVisible],
			"content",
		)
	})

	it("guards that bot specs cover every BOT_ALLOWED_TABLES entry", () => {
		const specs = buildBotVisibilitySpecs(fixture)
		const coveredTables = new Set(specs.map((spec) => spec.table))

		expect(specs).toHaveLength(BOT_ALLOWED_TABLES.length)
		for (const table of BOT_ALLOWED_TABLES) {
			expect(coveredTables.has(table), `missing bot spec for table ${table}`).toBe(true)
		}
	})

	it.each(BOT_ALLOWED_TABLES)(
		"filters bot %s through proxy to installed organizations only",
		async (table: BotAllowedTable) => {
			const spec = buildBotVisibilitySpecs(fixture).find((item) => item.table === table)
			expect(spec).toBeDefined()

			await waitFor(
				async () => {
					const result = await fetchShapeWithMeta(buildBotProxyUrl(table), {
						headers: { Authorization: `Bearer ${fixture.botToken}` },
					})
					if (result.status !== 200) return false

					try {
						assertVisibilitySpec(result.rows, spec!)
						return true
					} catch {
						return false
					}
				},
				{
					timeoutMs: 60000,
					intervalMs: 1000,
					name: `bot visibility for ${table}`,
				},
			)
		},
		60000,
	)

	it("returns zero rows for bot with no installations", async () => {
		for (const table of BOT_ALLOWED_TABLES) {
			const result = await fetchShapeWithMeta(buildBotProxyUrl(table), {
				headers: { Authorization: `Bearer ${fixture.noAccessBotToken}` },
			})
			expect(result.status).toBe(200)
			expect(result.rows.length, `expected empty rows for ${table}`).toBe(0)
		}
	})

	it("enforces bot soft-delete exclusion across scoped tables", async () => {
		const messageRows = await fetchShapeWithMeta(buildBotProxyUrl("messages"), {
			headers: { Authorization: `Bearer ${fixture.botToken}` },
		})
		const channelRows = await fetchShapeWithMeta(buildBotProxyUrl("channels"), {
			headers: { Authorization: `Bearer ${fixture.botToken}` },
		})
		const channelMemberRows = await fetchShapeWithMeta(buildBotProxyUrl("channel_members"), {
			headers: { Authorization: `Bearer ${fixture.botToken}` },
		})

		expect(collectIds(messageRows.rows)).not.toContain(fixture.ids.messages.publicADeleted)
		expect(collectIds(channelRows.rows)).not.toContain(fixture.ids.channels.deletedAccessibleA)
		expect(collectIds(channelMemberRows.rows)).not.toContain(fixture.ids.channelMembers.publicADeleted)
	})

	it("rejects disallowed bot table access", async () => {
		const response = await fetch(`${PROXY_BASE_URL}/bot/v1/shape?table=users&offset=-1`, {
			headers: { Authorization: `Bearer ${fixture.botToken}` },
		})
		expect(response.status).toBe(403)
	})

	it("rejects invalid bot token", async () => {
		const response = await fetch(`${PROXY_BASE_URL}/bot/v1/shape?table=messages&offset=-1`, {
			headers: { Authorization: "Bearer invalid-token" },
		})
		expect(response.status).toBe(401)
	})

	it("syncs incremental message inserts and excludes inaccessible deltas", async () => {
		const allowedId = crypto.randomUUID()
		const blockedId = crypto.randomUUID()
		const allowedContent = `SYNC_ALLOWED_MESSAGE_${fixture.runId}_${crypto.randomUUID().slice(0, 6)}`
		const blockedContent = `SYNC_BLOCKED_MESSAGE_${fixture.runId}_${crypto.randomUUID().slice(0, 6)}`
		let cursor = await fetchInitialCursor("messages")

		runSql(`
INSERT INTO messages (id, "channelId", "authorId", content, "createdAt", "updatedAt")
VALUES
	('${allowedId}', '${fixture.ids.channels.publicA}', '${fixture.ids.users.viewer}', '${allowedContent}', NOW(), NOW()),
	('${blockedId}', '${fixture.ids.channels.privateA}', '${fixture.ids.users.viewer}', '${blockedContent}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
`)

		await waitForSyncCheck({
			table: "messages",
			name: "incremental insert visibility",
			timeoutMs: 60000,
			check: async () => {
				const step = await fetchUserDeltaWithRefetch("messages", cursor)
				cursor = step.cursor

				const ids = new Set(collectIds(step.result.rows))
				const allowedOps = getOperationsForId(step.result.rawMessages, allowedId)
				const blockedOps = getOperationsForId(step.result.rawMessages, blockedId)
				const allowedVisible = ids.has(allowedId)
				const blockedVisible = ids.has(blockedId)
				const sawAllowedOp = allowedOps.some((op) => op === "insert" || op === "update")
				const sawBlockedOp = blockedOps.some((op) => op === "insert" || op === "update")
				const ok = step.didRefetch
					? allowedVisible && !blockedVisible
					: allowedVisible && !blockedVisible && sawAllowedOp && !sawBlockedOp

				return {
					ok,
					context: `status=${step.result.status} handle=${cursor.handle} offset=${cursor.offset} refetch=${String(step.didRefetch)} ids=${summarizeRowsById(step.result.rows)} allowedOps=${allowedOps.join(",")} blockedOps=${blockedOps.join(",")}`,
				}
			},
		})
	}, 60000)

	it("syncs incremental channel access grants via handle/offset", async () => {
		const allowedChannelId = crypto.randomUUID()
		const blockedChannelId = crypto.randomUUID()
		let cursor = await fetchInitialCursor("channels")

		runSql(`
INSERT INTO channels (id, name, type, "organizationId", "createdAt", "updatedAt")
VALUES
	('${allowedChannelId}', 'sync-visible-${fixture.runId}', 'public', '${fixture.ids.organizations.orgA}', NOW(), NOW()),
	('${blockedChannelId}', 'sync-hidden-${fixture.runId}', 'public', '${fixture.ids.organizations.orgA}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO channel_access ("userId", "channelId", "organizationId", "createdAt", "updatedAt")
VALUES
	('${fixture.ids.users.viewer}', '${allowedChannelId}', '${fixture.ids.organizations.orgA}', NOW(), NOW())
ON CONFLICT ("userId", "channelId") DO NOTHING;
`)

		await waitForSyncCheck({
			table: "channels",
			name: "incremental channel grants",
			timeoutMs: 60000,
			check: async () => {
				const step = await fetchUserDeltaWithRefetch("channels", cursor)
				cursor = step.cursor

				const ids = new Set(collectIds(step.result.rows))
				const allowedOps = getOperationsForId(step.result.rawMessages, allowedChannelId)
				const blockedOps = getOperationsForId(step.result.rawMessages, blockedChannelId)
				const allowedVisible = ids.has(allowedChannelId)
				const blockedVisible = ids.has(blockedChannelId)
				const sawAllowedOp = allowedOps.some((op) => op === "insert" || op === "update")
				const sawBlockedOp = blockedOps.some((op) => op === "insert" || op === "update")
				const ok = step.didRefetch
					? allowedVisible && !blockedVisible
					: allowedVisible && !blockedVisible && sawAllowedOp && !sawBlockedOp

				return {
					ok,
					context: `status=${step.result.status} handle=${cursor.handle} offset=${cursor.offset} refetch=${String(step.didRefetch)} ids=${summarizeRowsById(step.result.rows)} allowedOps=${allowedOps.join(",")} blockedOps=${blockedOps.join(",")}`,
				}
			},
		})
	}, 60000)

	it("syncs incremental integration_connections and blocks foreign org deltas", async () => {
		const allowedConnectionId = crypto.randomUUID()
		const blockedConnectionId = crypto.randomUUID()
		let cursor = await fetchInitialCursor("integration_connections")

		runSql(`
INSERT INTO integration_connections (
	id,
	provider,
	"organizationId",
	"userId",
	level,
	status,
	"externalAccountId",
	"externalAccountName",
	"connectedBy",
	settings,
	metadata,
	"createdAt",
	"updatedAt",
	"deletedAt"
)
VALUES
	('${allowedConnectionId}', 'discord', '${fixture.ids.organizations.orgA}', NULL, 'organization', 'active', 'sync-visible-${fixture.runId}', 'Sync Visible ${fixture.runId}', '${fixture.ids.users.viewer}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NULL),
	('${blockedConnectionId}', 'github', '${fixture.ids.organizations.orgB}', NULL, 'organization', 'active', 'sync-hidden-${fixture.runId}', 'Sync Hidden ${fixture.runId}', '${fixture.ids.users.otherUser}', '{}'::jsonb, '{}'::jsonb, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;
`)

		await waitForSyncCheck({
			table: "integration_connections",
			name: "incremental integration visibility",
			timeoutMs: 60000,
			check: async () => {
				const step = await fetchUserDeltaWithRefetch("integration_connections", cursor)
				cursor = step.cursor

				const ids = new Set(collectIds(step.result.rows))
				const allowedOps = getOperationsForId(step.result.rawMessages, allowedConnectionId)
				const blockedOps = getOperationsForId(step.result.rawMessages, blockedConnectionId)
				const allowedVisible = ids.has(allowedConnectionId)
				const blockedVisible = ids.has(blockedConnectionId)
				const sawAllowedOp = allowedOps.some((op) => op === "insert" || op === "update")
				const sawBlockedOp = blockedOps.some((op) => op === "insert" || op === "update")
				const ok = step.didRefetch
					? allowedVisible && !blockedVisible
					: allowedVisible && !blockedVisible && sawAllowedOp && !sawBlockedOp

				return {
					ok,
					context: `status=${step.result.status} handle=${cursor.handle} offset=${cursor.offset} refetch=${String(step.didRefetch)} ids=${summarizeRowsById(step.result.rows)} allowedOps=${allowedOps.join(",")} blockedOps=${blockedOps.join(",")}`,
				}
			},
		})
	}, 60000)

	it("syncs soft-delete removals and keeps final snapshot consistent", async () => {
		let cursor = await fetchInitialCursor("messages")
		const deletedMessageId = fixture.ids.messages.publicAVisible
		let sawRefetch = false

		runSql(`
UPDATE messages
SET "deletedAt" = NOW(), "updatedAt" = NOW()
WHERE id = '${deletedMessageId}';
`)

		await waitForSyncCheck({
			table: "messages",
			name: "soft-delete delta",
			timeoutMs: 60000,
			check: async () => {
				const step = await fetchUserDeltaWithRefetch("messages", cursor)
				cursor = step.cursor
				sawRefetch = sawRefetch || step.didRefetch

				const ids = new Set(collectIds(step.result.rows))
				const ops = getOperationsForId(step.result.rawMessages, deletedMessageId)
				const hasDeleteLikeOp = ops.some((op) => op === "delete" || op === "update")
				const stillVisibleInSnapshot = ids.has(deletedMessageId)
				const ok = step.didRefetch ? !stillVisibleInSnapshot : hasDeleteLikeOp

				return {
					ok,
					context: `status=${step.result.status} handle=${cursor.handle} offset=${cursor.offset} refetch=${String(step.didRefetch)} ids=${summarizeRowsById(step.result.rows)} ops=${ops.join(",")}`,
				}
			},
		})

		await waitFor(
			async () => {
				const finalNonce = `${SHAPE_NONCE}-final-${crypto.randomUUID().slice(0, 8)}`
				const finalSnapshotUrl = await buildUserShapeUrl("messages", fixture.viewer, {
					offset: "-1",
					nonce: finalNonce,
				})
				const finalSnapshot = await fetchShapeWithMeta(finalSnapshotUrl.toString())
				if (finalSnapshot.status !== 200) return false
				return !collectIds(finalSnapshot.rows).includes(deletedMessageId)
			},
			{
				timeoutMs: 60000,
				intervalMs: 1000,
				name: "messages snapshot reflects soft-delete",
			},
		)
		expect(typeof sawRefetch).toBe("boolean")
	}, 120000)
})

afterAll(() => {
	if (proxyLogs.length > 0) {
		console.log("[electric-proxy-e2e] proxy log tail:\n", proxyLogs.slice(-8000))
	}
})
