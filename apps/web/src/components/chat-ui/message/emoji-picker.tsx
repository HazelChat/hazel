import type { JSX, Resource } from "solid-js"
import { For, Match, Show, Switch, createMemo, createResource, createSignal, onMount } from "solid-js"
import { IconSearch } from "~/components/icons/search" // Assumed to exist
import { Popover } from "~/components/ui/popover" // Assumed to exist
import { TextField } from "~/components/ui/text-field" // Assumed to exist

// -----------------------------------------------------------------------------
// Data Configuration & Loading
// -----------------------------------------------------------------------------

const ORIGIN_GROUP_DATA_KEY = "data-by-group.json"
const ORIGIN_COMPONENTS_KEY = "data-emoji-components.json"
const ORIGIN_EMOJI_KEY = "data-by-emoji.json"
const CDN_URL = "https://unpkg.com/unicode-emoji-json@0.8.0/"

let GROUP_DATA_KEY = `${CDN_URL}${ORIGIN_GROUP_DATA_KEY}`
let COMPONENTS_KEY = `${CDN_URL}${ORIGIN_COMPONENTS_KEY}`
let EMOJI_KEY = `${CDN_URL}${ORIGIN_EMOJI_KEY}`

export function setCDN(url: string): void {
	GROUP_DATA_KEY = `${url}${ORIGIN_GROUP_DATA_KEY}`
	COMPONENTS_KEY = `${url}${ORIGIN_COMPONENTS_KEY}`
	EMOJI_KEY = `${url}${ORIGIN_EMOJI_KEY}`
}

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

export interface Emoji {
	emoji: string
	skin_tone_support: boolean
	name: string
	slug: string
	unicode_version: string
	emoji_version: string
}

export type EmojiData = Record<string, Emoji>

export interface EmojiGroupData {
	name: string
	slug: string
	emojis: Emoji[]
}

export type EmojiComponents = Record<string, string>
export type EmojiSkinTone = "light" | "medium-light" | "medium" | "medium-dark" | "dark"

// -----------------------------------------------------------------------------
// Data Fetching & Caching
// -----------------------------------------------------------------------------

let EMOJI_DATA: EmojiData | undefined
let EMOJI_COMPONENTS: EmojiComponents | undefined
let EMOJI_GROUP_DATA: EmojiGroupData[] | undefined

export async function loadEmojiData(): Promise<EmojiData> {
	if (!EMOJI_DATA) {
		const response = await fetch(EMOJI_KEY)
		// The raw data is a record where the key is the emoji, but the value object
		// doesn't contain the emoji character itself.
		const rawData = (await response.json()) as Record<string, Omit<Emoji, "emoji">>

		const processedData: EmojiData = {}
		// We iterate over the raw data to add the `emoji` property to each object,
		// making it conform to our `Emoji` interface.
		for (const emojiChar in rawData) {
			if (Object.prototype.hasOwnProperty.call(rawData, emojiChar)) {
				processedData[emojiChar] = {
					...rawData[emojiChar],
					emoji: emojiChar,
				}
			}
		}
		EMOJI_DATA = processedData
	}
	return EMOJI_DATA
}

export async function loadEmojiGroupData(): Promise<EmojiGroupData[]> {
	if (!EMOJI_GROUP_DATA) {
		const response = await fetch(GROUP_DATA_KEY)

		EMOJI_GROUP_DATA = (await response.json()) as EmojiGroupData[]
	}
	return EMOJI_GROUP_DATA
}

export async function loadEmojiComponents(): Promise<EmojiComponents> {
	if (!EMOJI_COMPONENTS) {
		const response = await fetch(COMPONENTS_KEY)
		EMOJI_COMPONENTS = (await response.json()) as EmojiComponents
	}
	return EMOJI_COMPONENTS
}

export function useEmojiData(): Resource<EmojiData | undefined> {
	const [data] = createResource<EmojiData>(loadEmojiData)
	return data
}

export function useEmojiComponents(): Resource<EmojiComponents | undefined> {
	const [data] = createResource<EmojiComponents>(loadEmojiComponents)
	return data
}

export function useEmojiGroupData(): Resource<EmojiGroupData[] | undefined> {
	const [data] = createResource<EmojiGroupData[]>(loadEmojiGroupData)
	return data
}

// -----------------------------------------------------------------------------
// Emoji Logic
// -----------------------------------------------------------------------------

const SKIN_TONE_TO_COMPONENT: Record<EmojiSkinTone, string> = {
	light: "light_skin_tone",
	"medium-light": "medium_light_skin_tone",
	medium: "medium_skin_tone",
	"medium-dark": "medium_dark_skin_tone",
	dark: "dark_skin_tone",
}

const VARIATION = "\uFE0F"
const ZWJ = "\u200D"

function getSkinToneComponent(components: EmojiComponents, skinTone?: EmojiSkinTone): string | undefined {
	if (skinTone) {
		return components[SKIN_TONE_TO_COMPONENT[skinTone]]
	}
	return undefined
}

function getEmojiWithSkinTone(emojis: EmojiData, emoji: Emoji, skinToneComponent?: string): string {
	if (!(skinToneComponent && emoji.skin_tone_support)) {
		return emoji.emoji
	}
	const emojiWithSkinTone = emoji.emoji
		.split(ZWJ)
		.map((chunk) => {
			if (chunk in emojis && emojis[chunk].skin_tone_support) {
				return `${chunk}${skinToneComponent}`
			}
			return chunk
		})
		.join(ZWJ)

	return emojiWithSkinTone.replaceAll(`${VARIATION}${skinToneComponent}`, `${skinToneComponent}`)
}

// -----------------------------------------------------------------------------
// UI Components
// -----------------------------------------------------------------------------

const RECENTS_KEY = "solid-emoji-picker-recents"
const RECENTS_SLUG = "recents"

function SkinToneSelector(props: {
	value?: EmojiSkinTone
	onChange: (skinTone?: EmojiSkinTone) => void
}) {
	const TONES: EmojiSkinTone[] = ["light", "medium-light", "medium", "medium-dark", "dark"]
	const TONE_COLORS: Record<EmojiSkinTone, string> = {
		light: "bg-[#FFDAB9]",
		"medium-light": "bg-[#E0BB95]",
		medium: "bg-[#C19A6B]",
		"medium-dark": "bg-[#A07651]",
		dark: "bg-[#6A462F]",
	}

	return (
		<Popover>
			<Popover.Trigger class="flex size-8 items-center justify-center rounded-md text-xl hover:bg-accent">
				<Switch fallback={"✋"}>
					<Match when={props.value === "light"}>🖐🏻</Match>
					<Match when={props.value === "medium-light"}>🖐🏻</Match>
					<Match when={props.value === "medium"}>🖐🏽</Match>
					<Match when={props.value === "medium-dark"}>🖐🏽</Match>
					<Match when={props.value === "dark"}>🖐🏽</Match>
				</Switch>

				<Show when={props.value}>
					<span
						class={`absolute right-1 bottom-1 block size-2.5 rounded-full border border-background ${TONE_COLORS[props.value!]}`}
					/>
				</Show>
			</Popover.Trigger>
			<Popover.Content class="w-auto p-1">
				<div class="flex items-center gap-1">
					<button
						type="button"
						onClick={() => props.onChange(undefined)}
						class="flex size-7 items-center justify-center rounded-md text-sm hover:bg-accent"
					>
						🚫
					</button>
					<For each={TONES}>
						{(tone) => (
							<button
								type="button"
								onClick={() => props.onChange(tone)}
								class={`size-7 rounded-md ${TONE_COLORS[tone]}`}
								aria-label={`${tone} skin tone`}
							/>
						)}
					</For>
				</div>
			</Popover.Content>
		</Popover>
	)
}

export interface EmojiPickerProps {
	onSelect: (emoji: string) => void
	onClose?: () => void
}

export function EmojiPicker(props: EmojiPickerProps) {
	// Data Resources
	const allEmojisData = useEmojiData()
	const componentsData = useEmojiComponents()
	const groupsData = useEmojiGroupData()

	// Local State
	const [search, setSearch] = createSignal("")
	const [skinTone, setSkinTone] = createSignal<EmojiSkinTone>()
	const [recents, setRecents] = createSignal<string[]>([])
	const [activeCategory, setActiveCategory] = createSignal<string>(RECENTS_SLUG)

	// Load recents from localStorage on mount
	onMount(() => {
		try {
			const stored = localStorage.getItem(RECENTS_KEY)
			if (stored) setRecents(JSON.parse(stored))
		} catch {
			/* noop */
		}
	})

	// Memoized Derived State
	const categories = createMemo(() => {
		const groups = groupsData()
		if (!groups) return [RECENTS_SLUG]
		return [RECENTS_SLUG, ...groups.map((g) => g.slug)]
	})

	const categoryDetails = createMemo(() => {
		const details: Record<string, { name: string; icon: string }> = {
			[RECENTS_SLUG]: { name: "Recently Used", icon: "🕘" },
		}
		// biome-ignore lint/complexity/noForEach: <explanation>
		groupsData()?.forEach((g) => {
			details[g.slug] = { name: g.name, icon: g.emojis[0]?.emoji || "❓" }
		})
		return details
	})

	const filteredEmojis = createMemo<Emoji[]>(() => {
		const allEmojis = allEmojisData()
		const groups = groupsData()
		const term = search().toLowerCase().trim()

		if (!allEmojis || !groups) return []

		if (term.length > 1) {
			const termForSlug = term.replace(/ /g, "_")
			return Object.values(allEmojis).filter(
				(e) => e.name.includes(term) || e.slug.includes(termForSlug),
			)
		}

		if (activeCategory() === RECENTS_SLUG) {
			return recents()
				.map((emojiChar) => allEmojis[emojiChar])
				.filter(Boolean) as Emoji[]
		}

		const activeGroup = groups.find((g) => g.slug === activeCategory())
		return activeGroup ? activeGroup.emojis : []
	})

	// Event Handlers
	function updateRecents(emoji: Emoji) {
		const next = [emoji.emoji, ...recents().filter((e) => e !== emoji.emoji)].slice(0, 32) // Store up to 32 recents
		setRecents(next)
		try {
			localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
		} catch {
			/* noop */
		}
	}

	function handleSelect(emoji: Emoji) {
		const components = componentsData()
		if (!components) return

		const skinToneComponent = getSkinToneComponent(components, skinTone())
		const finalEmoji = getEmojiWithSkinTone(allEmojisData()!, emoji, skinToneComponent)

		updateRecents(emoji)
		props.onSelect(finalEmoji)
		props.onClose?.()
	}

	return (
		<div class="w-72 select-none text-foreground">
			{/* Header: Search & Skin Tones */}
			<div class="flex items-center gap-2 border-b p-2">
				<TextField
					placeholder="Search emojis..."
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
					suffix={<IconSearch class="mr-2 size-4 text-muted-foreground" />}
					autofocus
					class="flex-grow"
				/>
				<SkinToneSelector value={skinTone()} onChange={setSkinTone} />
			</div>

			{/* Category Tabs */}
			<div class="flex flex-nowrap items-center gap-1 overflow-x-auto border-b p-2">
				<For each={categories()}>
					{(slug) => (
						<button
							type="button"
							title={categoryDetails()[slug]?.name}
							class="flex-shrink-0 rounded-md p-1.5 text-xl leading-none hover:bg-accent data-[active=true]:bg-muted"
							data-active={activeCategory() === slug}
							onClick={() => {
								setSearch("")
								setActiveCategory(slug)
							}}
						>
							{categoryDetails()[slug]?.icon}
						</button>
					)}
				</For>
			</div>

			{/* Emoji Grid */}
			<div class="h-60 overflow-y-auto p-2">
				<Show
					when={!allEmojisData.loading}
					fallback={<p class="py-4 text-center text-muted-foreground text-sm">Loading Emojis...</p>}
				>
					<Show
						when={filteredEmojis().length > 0}
						fallback={
							<p class="py-4 text-center text-muted-foreground text-sm">No emojis found</p>
						}
					>
						<div class="grid grid-cols-8 gap-1">
							<For each={filteredEmojis()}>
								{(item) => (
									<button
										type="button"
										title={item.name}
										class="rounded p-1 text-2xl leading-none hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
										onClick={() => handleSelect(item)}
									>
										{getEmojiWithSkinTone(
											allEmojisData()!,
											item,
											getSkinToneComponent(componentsData()!, skinTone()),
										)}
									</button>
								)}
							</For>
						</div>
					</Show>
				</Show>
			</div>
		</div>
	)
}
