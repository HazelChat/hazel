/**
 * GitHub brand colors for embeds and UI.
 * Semantic colors matching GitHub's design system.
 */
export const GITHUB_COLORS = {
	// Push events
	push: 0x2ea44f, // GitHub green

	// Pull request states
	pr_opened: 0x238636, // Green
	pr_closed: 0xda3633, // Red
	pr_merged: 0x8957e5, // Purple
	pr_draft: 0x6e7681, // Gray
	pr_ready: 0x238636, // Green

	// Issue states
	issue_opened: 0x238636, // Green
	issue_closed: 0xda3633, // Red
	issue_reopened: 0x238636, // Green

	// Release
	release: 0x1f6feb, // Blue

	// Deployment states
	deployment_success: 0x238636, // Green
	deployment_failure: 0xda3633, // Red
	deployment_pending: 0xdbab09, // Yellow

	// Workflow run states
	workflow_success: 0x238636, // Green
	workflow_failure: 0xda3633, // Red
	workflow_cancelled: 0x6e7681, // Gray
	workflow_pending: 0xdbab09, // Yellow

	// Star events
	star: 0xf1e05a, // GitHub yellow/gold star color
} as const

export type GitHubColorKey = keyof typeof GITHUB_COLORS
