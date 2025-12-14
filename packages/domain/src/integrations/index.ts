// Re-export common integration utilities for backwards compatibility
// NOTE: We only re-export browser-safe code here. Node.js-only code
// (jwt-service, api-client) should be imported directly from @hazel/integrations/github
export * from "@hazel/integrations/common"

// Re-export browser-safe GitHub exports (schemas, colors, types)
export { GITHUB_COLORS, type GitHubColorKey } from "@hazel/integrations/github/schema"
