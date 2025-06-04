import { For, Show } from "solid-js"

export interface MentionSuggestionsProps {
	suggestions: string[]
	onSelect: (username: string) => void
	activeIndex: number
}

export function MentionSuggestions(props: MentionSuggestionsProps) {
	return (
		<Show when={props.suggestions.length > 0}>
			<ul class="absolute z-50 mt-1 w-48 rounded border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<For each={props.suggestions}>
					{(username, i) => (
						<li
							class={`cursor-pointer px-3 py-2 hover:bg-blue-100 dark:hover:bg-gray-700 ${props.activeIndex === i() ? "bg-blue-100 dark:bg-gray-700" : ""}`}
							onMouseDown={(e) => {
								e.preventDefault()
								props.onSelect(username)
							}}
						>
							@{username}
						</li>
					)}
				</For>
			</ul>
		</Show>
	)
}
