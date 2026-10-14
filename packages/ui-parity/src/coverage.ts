import { execFileSync } from "node:child_process"
import { LEGACY_BASELINE_REF, repoRoot } from "./config.ts"
import { scenarios } from "./scenarios.ts"

/**
 * Lists legacy routes (read from the pinned baseline, since `apps/web` is gone) that no scenario visits. This is the migration to-do list:
 * a screen is only "ported" once a scenario captures it and the diff is clean.
 */
const DEV_ONLY = /^\/(ui|dev)(\/|$)/

export const uncoveredRoutes = () => {
	const routeTree = execFileSync("git", ["show", `${LEGACY_BASELINE_REF}:apps/web/src/routeTree.gen.ts`], {
		cwd: repoRoot,
		encoding: "utf8",
	})
	const block = routeTree.match(/interface FileRoutesByFullPath \{([\s\S]*?)\n\}/)?.[1] ?? ""
	const routes = [
		...new Set([...block.matchAll(/'([^']+)':/g)].map((match) => match[1]!.replace(/(.)\/$/, "$1"))),
	]
	const toPattern = (route: string) =>
		new RegExp(`^${route.replace(/\/\$$/, "(/.*)?").replace(/\$[^/]+/g, "[^/]+")}/?$`)
	return routes
		.filter((route) => !DEV_ONLY.test(route))
		.map((route) => ({
			route,
			scenarios: scenarios
				.filter((scenario) => toPattern(route).test(scenario.path))
				.map((scenario) => scenario.id),
		}))
}
