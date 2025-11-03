"use client"

import { BlockquotePlugin } from "@platejs/basic-nodes/react"
import { ParagraphPlugin } from "platejs/react"
import { BlockquoteElement } from "../static-ui/blockquote-node"
import { ParagraphElement } from "../static-ui/paragraph-node"

export const BasicBlocksKit = [
	ParagraphPlugin.withComponent(ParagraphElement),
	BlockquotePlugin.configure({
		node: { component: BlockquoteElement },
		shortcuts: { toggle: { keys: "mod+shift+period" } },
	}),
]
