import { Effect, Layer } from "effect"
import { Runtime } from "foldkit"
import { type EditorRegistry, EditorRegistryLive } from "../editor/registry"
import { type HazelRpc, HazelRpcLive } from "../rpc"
import { applyTheme, defaultCustomization, resolveSystemTheme } from "../theme"

/** What a gallery program's Commands may use: the RPC client, and the live editors (the composer). */
type GalleryResources = HazelRpc | EditorRegistry

/**
 * A gallery entry is a self-contained Foldkit program for one primitive, booted on
 * `/dev/gallery/<name>` instead of the main app. Closing over the program keeps each
 * entry fully typed while the registry only holds `start` functions.
 */
export interface GalleryEntry {
	readonly title: string
	readonly start: (container: HTMLElement) => void
}

export const defineGallery = <Model, Message extends { _tag: string }>(
	title: string,
	program: Omit<Runtime.ElementConfig<Model, Message, GalleryResources>, "container" | "resources">,
): GalleryEntry => ({
	title,
	start: (container) => {
		// Same theme effects as the app's ThemeProvider port; captures fix the color scheme, so once is enough.
		Effect.runSync(applyTheme(resolveSystemTheme(), defaultCustomization()))
		Runtime.run(
			Runtime.makeElement<Model, Message, GalleryResources>({
				...program,
				container,
				resources: Layer.merge(HazelRpcLive, EditorRegistryLive),
			}),
		)
	},
})
