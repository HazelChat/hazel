import { Atom, Registry } from "@effect-atom/atom-react"
import { runtimeLayer } from "./services/common/runtime"
import { isTauri } from "./platform"

export const appRegistry = Registry.make()

const sharedAtomRuntime = Atom.runtime(runtimeLayer)

appRegistry.mount(sharedAtomRuntime)

// Initialize desktop auth if running in Tauri
if (isTauri()) {
	import("./desktop-auth").then(({ desktopAuth }) => {
		desktopAuth.init().catch(console.error)
	})
}
