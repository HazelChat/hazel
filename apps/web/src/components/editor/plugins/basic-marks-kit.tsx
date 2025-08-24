"use client"

import {
	BoldPlugin,
	CodePlugin,
	HighlightPlugin,
	ItalicPlugin,
	KbdPlugin,
	StrikethroughPlugin,
	SubscriptPlugin,
	SuperscriptPlugin,
	UnderlinePlugin,
} from "@platejs/basic-nodes/react"

import { CodeLeaf } from "~/components/editor/editor-ui/code-node"
import { HighlightLeaf } from "~/components/editor/static-ui/highlight-node"
import { KbdLeaf } from "~/components/editor/static-ui/kbd-node"
import { ListKit } from "./list-kit"

export const BasicMarksKit = [
	BoldPlugin,
	ItalicPlugin,
	UnderlinePlugin,
	CodePlugin.configure({
		node: { component: CodeLeaf },
		shortcuts: { toggle: { keys: "mod+e" } },
	}),
	StrikethroughPlugin.configure({
		shortcuts: { toggle: { keys: "mod+shift+x" } },
	}),
	SubscriptPlugin.configure({
		shortcuts: { toggle: { keys: "mod+comma" } },
	}),
	SuperscriptPlugin.configure({
		shortcuts: { toggle: { keys: "mod+period" } },
	}),
	HighlightPlugin.configure({
		node: { component: HighlightLeaf },
		shortcuts: { toggle: { keys: "mod+shift+h" } },
	}),
	KbdPlugin.withComponent(KbdLeaf),

	...ListKit,
]
