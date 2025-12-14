/**
 * Integration constants shared across the codebase.
 */

/**
 * External ID for the GitHub integration bot user.
 * Used for creating messages from GitHub webhooks.
 */
export const GITHUB_BOT_EXTERNAL_ID = "integration-bot-github"

/**
 * External ID for the Linear integration bot user.
 */
export const LINEAR_BOT_EXTERNAL_ID = "integration-bot-linear"

/**
 * External ID for the Figma integration bot user.
 */
export const FIGMA_BOT_EXTERNAL_ID = "integration-bot-figma"

/**
 * External ID for the Notion integration bot user.
 */
export const NOTION_BOT_EXTERNAL_ID = "integration-bot-notion"

/**
 * External ID pattern for integration bot users.
 * Format: "integration-bot-{provider}"
 */
export const makeIntegrationBotExternalId = (provider: string): string => `integration-bot-${provider}`
