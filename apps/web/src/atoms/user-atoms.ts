import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Mutation atom for updating Hazel-specific user preferences (timezone, settings).
 * Identity fields (firstName/lastName/avatarUrl) are owned by Clerk — use
 * `useUser().user.update(...)` / `setProfileImage(...)` on the client instead.
 */
export const updateUserMutation = HazelRpcClient.mutation("user.update")

/**
 * Mutation atom for finalizing user onboarding
 */
export const finalizeOnboardingMutation = HazelRpcClient.mutation("user.finalizeOnboarding")
