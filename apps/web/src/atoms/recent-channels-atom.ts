import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"

export const MAX_RECENT_CHANNELS = 8

/**
 * Schema for a single recent channel entry
 */
const RecentChannelSchema = Schema.Struct({
	channelId: Schema.String,
	visitedAt: Schema.Number,
})

export type RecentChannel = typeof RecentChannelSchema.Type

/**
 * Schema for the array of recent channels
 */
const RecentChannelsSchema = Schema.Array(RecentChannelSchema)

/**
 * localStorage runtime for recent channels persistence
 */
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

/**
 * Atom that stores recent channels in localStorage
 * Automatically persists changes - no manual localStorage calls needed
 */
export const recentChannelsAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "recentChannels",
	schema: RecentChannelsSchema,
	defaultValue: () => [] as RecentChannel[],
}).pipe(Atom.keepAlive)
