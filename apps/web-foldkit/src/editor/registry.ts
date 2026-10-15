import { Context, Effect, Layer, Schema, type Scope } from "effect"
import type { EditorView } from "prosemirror-view"

/**
 * The live ProseMirror editors by id. An editor's Mount registers it for the element's lifetime;
 * Commands reach it through the `EditorRegistry` Resource and fail with `EditorNotMounted` when its
 * element is not in the DOM (a tab switched away, a closed palette).
 *
 * Mount `execute` cannot require services, so the Mounts register into the one `editorRegistry`
 * instance directly; `EditorRegistryLive` hands that same instance to Commands.
 */

export class EditorNotMounted extends Schema.TaggedError<EditorNotMounted>()("EditorNotMounted", {
	editorId: Schema.String,
}) {}

export interface EditorRegistryShape {
	/** Holds `view` under `editorId` until the scope closes (the Mount's lifetime). */
	readonly register: (editorId: string, view: EditorView) => Effect.Effect<void, never, Scope.Scope>
	readonly get: (editorId: string) => Effect.Effect<EditorView, EditorNotMounted>
}

const makeRegistry = (): EditorRegistryShape => {
	const editors = new Map<string, EditorView>()
	return {
		register: (editorId, view) =>
			Effect.acquireRelease(
				Effect.sync(() => {
					editors.set(editorId, view)
				}),
				() =>
					Effect.sync(() => {
						// A remounted editor may already have replaced this one.
						if (editors.get(editorId) === view) editors.delete(editorId)
					}),
			),
		get: (editorId) =>
			Effect.suspend(() => {
				const view = editors.get(editorId)
				return view === undefined
					? Effect.fail(new EditorNotMounted({ editorId }))
					: Effect.succeed(view)
			}),
	}
}

export const editorRegistry: EditorRegistryShape = makeRegistry()

export class EditorRegistry extends Context.Service<EditorRegistry, EditorRegistryShape>()(
	"EditorRegistry",
) {}

export const EditorRegistryLive = Layer.succeed(EditorRegistry, editorRegistry)

/** Run `f` on the live editor `editorId`. */
export const withEditor = <A>(editorId: string, f: (view: EditorView) => A) =>
	EditorRegistry.use((registry) => registry.get(editorId)).pipe(Effect.map(f))
