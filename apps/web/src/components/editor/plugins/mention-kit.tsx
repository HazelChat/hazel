"use client"

import { MentionInputPlugin, MentionPlugin } from "@platejs/mention/react"

import { MentionElement, MentionInputElement } from "../editor-ui/mention-node"

export const MentionKit = [
	MentionPlugin.configure({
		options: {
			trigger: "@",
			triggerPreviousCharPattern: /^$|^[\s"']$/,
			insertSpaceAfterMention: false,
		},
	}).withComponent(MentionElement),
	MentionInputPlugin.configure({
		options: {},
	}).withComponent(MentionInputElement),
]
