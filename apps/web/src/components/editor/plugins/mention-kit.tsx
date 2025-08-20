"use client"

import { MentionInputPlugin, MentionPlugin } from "@platejs/mention/react"

import { MentionElement, MentionInputElement } from "~/components/editor-ui/mention-node"

export const MentionKit = [
	MentionPlugin.configure({
		options: {
			trigger: "@",
			triggerPreviousCharPattern: /^$|^[\s"']$/,
			insertSpaceAfterMention: false,
		},
	}).withComponent(MentionElement),
	MentionInputPlugin.withComponent(MentionInputElement),
]
