import { For } from "solid-js"
import type { Components } from "./types"

export const Text: Components["text"] = (props) => (
	<For each={[...props.node.value]}>{(char) => <span class="">{char}</span>}</For>
)
