import { Atom } from "@effect-atom/atom-react"

const MAX_RECENT_CHANNELS = 8
const STORAGE_KEY = "recentChannels"

export interface RecentChannel {
	channelId: string
	visitedAt: number
}

const loadFromStorage = (): RecentChannel[] => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored ? JSON.parse(stored) : []
	} catch {
		return []
	}
}

const saveToStorage = (channels: RecentChannel[]) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(channels))
	} catch {
		// Ignore storage errors
	}
}

export const recentChannelsAtom = Atom.make<RecentChannel[]>(loadFromStorage()).pipe(Atom.keepAlive)

export const trackRecentChannel = (channelId: string) => {
	Atom.batch(() => {
		Atom.update(recentChannelsAtom, (channels) => {
			const filtered = channels.filter((c) => c.channelId !== channelId)
			const updated = [{ channelId, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT_CHANNELS)
			saveToStorage(updated)
			return updated
		})
	})
}

export const clearRecentChannels = () => {
	Atom.batch(() => {
		Atom.set(recentChannelsAtom, [])
		localStorage.removeItem(STORAGE_KEY)
	})
}
