import { appendFileSync, mkdirSync, rmSync } from "node:fs"
import path from "node:path"

type Primitive = string | number | boolean | null

export type ChatSyncDiagnosticRecord = {
	suite: string
	testCase: string
	workerMethod: string
	action: string
	dedupeKey?: string
	syncConnectionId?: string
	channelLinkId?: string
	expected?: Primitive | Record<string, Primitive>
	actual?: Primitive | Record<string, Primitive>
	metadata?: Record<string, Primitive>
}

const resolveDiagnosticsDir = (): string => {
	const configured = process.env.CHAT_SYNC_TEST_DIAGNOSTICS_DIR
	if (configured && configured.trim().length > 0) {
		return path.resolve(configured)
	}
	return path.resolve(process.cwd(), ".artifacts/chat-sync")
}

const diagnosticsFilePath = (): string =>
	path.join(resolveDiagnosticsDir(), "chat-sync-diagnostics.jsonl")

export const resetChatSyncDiagnostics = (): void => {
	const dir = resolveDiagnosticsDir()
	rmSync(dir, { recursive: true, force: true })
}

export const recordChatSyncDiagnostic = (record: ChatSyncDiagnosticRecord): void => {
	const dir = resolveDiagnosticsDir()
	mkdirSync(dir, { recursive: true })
	appendFileSync(
		diagnosticsFilePath(),
		`${JSON.stringify({ timestamp: new Date().toISOString(), ...record })}\n`,
		"utf8",
	)
}
