"use client"

import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from "@platejs/code-block/react"
import { lowlight } from "~/lib/lowlight-config"
import { CodeBlockElement } from "../editor-ui/code-block-element"
import { CodeLineElement } from "../editor-ui/code-line-element"
import { CodeSyntaxLeaf } from "../editor-ui/code-syntax-leaf"

export const CodeBlockKit = [
	CodeBlockPlugin.configure({
		node: { component: CodeBlockElement },
		options: {
			lowlight,
		},
	}),
	CodeLinePlugin.configure({
		node: { component: CodeLineElement },
	}),
	CodeSyntaxPlugin.configure({
		node: { component: CodeSyntaxLeaf },
	}),
]
