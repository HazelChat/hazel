import { ServiceMap } from "effect"
import { RequiredScopes } from "./required-scopes"

/**
 * Validates that all RPCs in a group have a RequiredScopes annotation.
 * Returns the list of RPC tags that are missing annotations.
 */
export const validateRpcGroupScopes = (
	requests: ReadonlyMap<string, { readonly annotations: ServiceMap.ServiceMap<never> }>,
	groupName: string,
): { valid: boolean; missing: string[] } => {
	const missing: string[] = []
	for (const [tag, rpc] of requests) {
		const scopes = ServiceMap.get(rpc.annotations, RequiredScopes) as ReadonlyArray<string> | undefined
		if (!scopes) {
			missing.push(`${groupName}.${tag}`)
		}
	}
	return { valid: missing.length === 0, missing }
}
