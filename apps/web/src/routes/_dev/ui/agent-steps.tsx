import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { AgentSteps, type AgentStep } from "~/components/chat/agent-steps-view"
import { Button } from "~/components/ui/button"

export const Route = createFileRoute("/_dev/ui/agent-steps")({
	component: RouteComponent,
})

// Mock data scenarios
const createMockSteps = {
	manyToolCalls: (): AgentStep[] => [
		{
			id: "think-1",
			type: "thinking",
			status: "completed",
			content:
				"I need to search for relevant memories first, then check the user's preferences, and finally create a response based on the context.",
			startedAt: Date.now() - 5000,
			completedAt: Date.now() - 2355,
		},
		{
			id: "tool-1",
			type: "tool_call",
			status: "completed",
			toolName: "linear_search_issues",
			toolInput: { query: "authentication bug", limit: 10 },
			toolOutput: { results: [{ id: "LIN-123", title: "Auth token expiry" }] },
		},
		{
			id: "tool-2",
			type: "tool_call",
			status: "completed",
			toolName: "github_search_code",
			toolInput: { query: "handleAuth", repo: "acme/app" },
			toolOutput: { matches: 3 },
		},
		{
			id: "tool-3",
			type: "tool_call",
			status: "completed",
			toolName: "notion_search_pages",
			toolInput: { query: "authentication docs" },
			toolOutput: { pages: [{ id: "page-1", title: "Auth Architecture" }] },
		},
		{
			id: "tool-4",
			type: "tool_call",
			status: "completed",
			toolName: "slack_search_messages",
			toolInput: { query: "auth issue", channel: "engineering" },
			toolOutput: { messages: [] },
		},
		{
			id: "think-2",
			type: "thinking",
			status: "completed",
			content: "Based on the search results, I can see there's an existing issue in Linear about this.",
			startedAt: Date.now() - 2000,
			completedAt: Date.now() - 1778,
		},
		{
			id: "tool-5",
			type: "tool_call",
			status: "completed",
			toolName: "linear_get_issue",
			toolInput: { issueId: "LIN-123" },
			toolOutput: {
				id: "LIN-123",
				title: "Auth token expiry",
				description: "Tokens expire too quickly",
				status: "In Progress",
			},
		},
	],

	activeToolCall: (): AgentStep[] => [
		{
			id: "think-1",
			type: "thinking",
			status: "completed",
			content: "Let me search for that information.",
			startedAt: Date.now() - 3000,
			completedAt: Date.now() - 1500,
		},
		{
			id: "tool-1",
			type: "tool_call",
			status: "completed",
			toolName: "searchMemories",
			toolInput: { query: "user preferences" },
			toolOutput: { found: 5 },
		},
		{
			id: "tool-2",
			type: "tool_call",
			status: "active",
			toolName: "fetchUserData",
			toolInput: { userId: "user-123" },
		},
	],

	withError: (): AgentStep[] => [
		{
			id: "think-1",
			type: "thinking",
			status: "completed",
			content: "I'll try to connect to the external service.",
			startedAt: Date.now() - 2000,
			completedAt: Date.now() - 1200,
		},
		{
			id: "tool-1",
			type: "tool_call",
			status: "completed",
			toolName: "github_list_repos",
			toolInput: { org: "acme" },
			toolOutput: { repos: ["app", "api", "docs"] },
		},
		{
			id: "tool-2",
			type: "tool_call",
			status: "failed",
			toolName: "github_create_issue",
			toolInput: { repo: "acme/app", title: "Bug report" },
			toolError: "Rate limit exceeded. Please try again in 60 seconds.",
		},
		{
			id: "tool-3",
			type: "tool_call",
			status: "completed",
			toolName: "slack_send_message",
			toolInput: { channel: "alerts", message: "API rate limited" },
			toolOutput: { sent: true },
		},
	],

	singleToolCall: (): AgentStep[] => [
		{
			id: "think-1",
			type: "thinking",
			status: "completed",
			content: "Simple query, just need one lookup.",
			startedAt: Date.now() - 1000,
			completedAt: Date.now() - 500,
		},
		{
			id: "tool-1",
			type: "tool_call",
			status: "completed",
			toolName: "getWeather",
			toolInput: { city: "San Francisco" },
			toolOutput: { temp: 68, condition: "Sunny" },
		},
	],

	activeThinking: (): AgentStep[] => [
		{
			id: "think-1",
			type: "thinking",
			status: "active",
			content: "Analyzing the request and determining the best approach...",
			startedAt: Date.now() - 500,
		},
	],

	mixedStates: (): AgentStep[] => [
		{
			id: "think-1",
			type: "thinking",
			status: "completed",
			content: "First, let me gather all the necessary information.",
			startedAt: Date.now() - 8000,
			completedAt: Date.now() - 5000,
		},
		{
			id: "tool-1",
			type: "tool_call",
			status: "completed",
			toolName: "notion_search_pages",
			toolInput: { query: "project roadmap" },
			toolOutput: { pages: [{ title: "Q1 Roadmap" }] },
		},
		{
			id: "tool-2",
			type: "tool_call",
			status: "completed",
			toolName: "linear_list_projects",
			toolInput: { teamId: "eng" },
			toolOutput: { projects: ["Platform", "Mobile", "API"] },
		},
		{
			id: "think-2",
			type: "thinking",
			status: "completed",
			content: "Found the roadmap. Now let me check the current sprint.",
			startedAt: Date.now() - 4000,
			completedAt: Date.now() - 3000,
		},
		{
			id: "tool-3",
			type: "tool_call",
			status: "completed",
			toolName: "linear_get_cycle",
			toolInput: { cycleId: "current" },
			toolOutput: { name: "Sprint 23", progress: 65 },
		},
		{
			id: "tool-4",
			type: "tool_call",
			status: "failed",
			toolName: "jira_sync",
			toolInput: { projectKey: "ACME" },
			toolError: "Connection timeout - Jira server unreachable",
		},
		{
			id: "tool-5",
			type: "tool_call",
			status: "active",
			toolName: "slack_post_update",
			toolInput: { channel: "team-updates", message: "Sprint progress: 65%" },
		},
	],
}

type ScenarioKey = keyof typeof createMockSteps

const scenarios: { key: ScenarioKey; label: string; description: string }[] = [
	{
		key: "manyToolCalls",
		label: "Many Tool Calls",
		description: "Multiple consecutive tool calls grouped as chips",
	},
	{
		key: "activeToolCall",
		label: "Active Tool Call",
		description: "Tool call currently in progress with spinner",
	},
	{
		key: "withError",
		label: "With Error",
		description: "Mix of successful and failed tool calls",
	},
	{ key: "singleToolCall", label: "Single Tool", description: "Just one tool call" },
	{ key: "activeThinking", label: "Active Thinking", description: "Thinking step in progress" },
	{
		key: "mixedStates",
		label: "Mixed States",
		description: "Complex scenario with various states",
	},
]

function RouteComponent() {
	const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("manyToolCalls")
	const [status, setStatus] = useState<"idle" | "active" | "completed" | "failed">("completed")

	const steps = createMockSteps[selectedScenario]()
	const currentIndex = steps.findIndex((s) => s.status === "active")

	return (
		<div className="space-y-8">
			<div>
				<h2 className="mb-2 font-semibold text-xl">Agent Steps Component</h2>
				<p className="text-muted-fg">
					Compact UI for displaying AI agent workflow steps with grouped tool calls.
				</p>
			</div>

			{/* Scenario selector */}
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Scenario</h3>
				<div className="flex flex-wrap gap-2">
					{scenarios.map((scenario) => (
						<Button
							key={scenario.key}
							intent={selectedScenario === scenario.key ? "primary" : "secondary"}
							size="sm"
							onPress={() => setSelectedScenario(scenario.key)}
						>
							{scenario.label}
						</Button>
					))}
				</div>
				<p className="text-muted-fg text-sm">
					{scenarios.find((s) => s.key === selectedScenario)?.description}
				</p>
			</div>

			{/* Status selector */}
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Global Status</h3>
				<div className="flex flex-wrap gap-2">
					{(["idle", "active", "completed", "failed"] as const).map((s) => (
						<Button
							key={s}
							intent={status === s ? "primary" : "secondary"}
							size="sm"
							onPress={() => setStatus(s)}
						>
							{s}
						</Button>
					))}
				</div>
			</div>

			{/* Preview */}
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Preview</h3>
				<div className="rounded-lg border border-border bg-surface p-4">
					<div className="max-w-2xl">
						<AgentSteps.Root
							steps={steps}
							currentIndex={currentIndex >= 0 ? currentIndex : null}
							status={status}
						/>
					</div>
				</div>
			</div>

			{/* Raw data */}
			<div className="space-y-3">
				<h3 className="font-medium text-sm">Raw Data</h3>
				<pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs">
					{JSON.stringify(steps, null, 2)}
				</pre>
			</div>
		</div>
	)
}
