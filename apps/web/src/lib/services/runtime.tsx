import { type JSX, createContext, onCleanup, useContext } from "solid-js"
import type { LiveManagedRuntime } from "./live-layer"

export const RuntimeContext = createContext<LiveManagedRuntime | null>(null)

export const useRuntime = (): LiveManagedRuntime => {
	const runtimeContent = useContext(RuntimeContext)

	if (!runtimeContent) {
		throw new Error("useRuntime must be used within a RuntimeProvider")
	}

	return runtimeContent
}

export const RuntimeProvider = (props: { children: JSX.Element; runtime: LiveManagedRuntime }) => {
	onCleanup(() => {
		props.runtime.dispose()
	})

	return <RuntimeContext.Provider value={props.runtime}>{props.children}</RuntimeContext.Provider>
}
