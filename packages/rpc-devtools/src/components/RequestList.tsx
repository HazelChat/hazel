import { getRpcType } from "../rpc-type-resolver"
import type { CapturedRequest } from "../types"
import { formatRelativeTime } from "../utils/format-relative-time"
import { styles } from "./styles"

interface RequestListProps {
	requests: CapturedRequest[]
	selectedId: string | null
	onSelect: (id: string | null) => void
}

export function RequestList({ requests, selectedId, onSelect }: RequestListProps) {
	if (requests.length === 0) {
		return <div style={styles.emptyState}>No RPC requests captured yet</div>
	}

	return (
		<div style={styles.listContainer}>
			<table style={styles.table}>
				<thead style={styles.tableHeader}>
					<tr>
						<th style={styles.tableHeaderCell}>Method</th>
						<th style={{ ...styles.tableHeaderCell, width: "80px" }}>Status</th>
						<th style={{ ...styles.tableHeaderCell, ...styles.headerCellRight, width: "80px" }}>
							Time
						</th>
						<th style={{ ...styles.tableHeaderCell, ...styles.headerCellRight, width: "96px" }}>
							When
						</th>
					</tr>
				</thead>
				<tbody>
					{requests.map((request) => (
						<tr
							key={request.captureId}
							onClick={() =>
								onSelect(selectedId === request.captureId ? null : request.captureId)
							}
							style={styles.tableRow(selectedId === request.captureId)}
						>
							<td style={styles.tableCell}>
								<code style={styles.methodCode}>{request.method}</code>
								<MethodTypeBadge type={request.type} />
							</td>
							<td style={styles.tableCell}>
								<StatusBadge request={request} />
							</td>
							<td style={{ ...styles.tableCell, ...styles.timeCell }}>
								{request.response?.duration != null
									? `${request.response.duration}ms`
									: "..."}
							</td>
							<td style={{ ...styles.tableCell, ...styles.whenCell }}>
								{formatRelativeTime(request.timestamp)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function StatusBadge({ request }: { request: CapturedRequest }) {
	if (!request.response) {
		return (
			<span style={{ ...styles.statusBadge.base, ...styles.statusBadge.pending }}>
				<span style={styles.statusDot("#facc15", true)} />
				pending
			</span>
		)
	}

	if (request.response.status === "success") {
		return (
			<span style={{ ...styles.statusBadge.base, ...styles.statusBadge.success }}>
				<span style={styles.statusDot("#4ade80")} />
				success
			</span>
		)
	}

	return (
		<span style={{ ...styles.statusBadge.base, ...styles.statusBadge.error }}>
			<span style={styles.statusDot("#f87171")} />
			error
		</span>
	)
}

function MethodTypeBadge({ type }: { type: "mutation" | "query" | undefined }) {
	// Use the captured type from the request, fall back to query for unknown
	const resolvedType = type ?? "query"

	if (resolvedType === "mutation") {
		return <span style={{ ...styles.typeBadge.base, ...styles.typeBadge.mutation }}>mutation</span>
	}
	return <span style={{ ...styles.typeBadge.base, ...styles.typeBadge.query }}>query</span>
}
