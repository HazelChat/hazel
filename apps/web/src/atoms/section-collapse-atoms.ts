import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import type { ChannelSectionId } from "@hazel/schema"
import { Schema } from "effect"

/**
 * localStorage runtime for section collapse persistence
 */
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

/**
 * Schema for collapsed sections state
 * Maps section IDs to their collapsed state
 */
const CollapsedSectionsSchema = Schema.Record({
	key: Schema.String,
	value: Schema.Boolean,
})

/**
 * Atom that stores collapsed state for all sections
 * Persisted to localStorage as "section_collapsed_state"
 */
export const collapsedSectionsAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "section_collapsed_state",
	schema: CollapsedSectionsSchema,
	defaultValue: () => ({}) as Record<string, boolean>,
})

/**
 * Atom family that returns the collapsed state for a specific section
 */
export const sectionCollapsedAtomFamily = Atom.family((sectionId: ChannelSectionId | "default" | "dms") =>
	Atom.make((get) => {
		const collapsedSections = get(collapsedSectionsAtom)
		return collapsedSections[sectionId] ?? false
	}),
)
