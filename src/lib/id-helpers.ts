import { customAlphabet } from "nanoid"
import type { Schema } from "./zero/schema"

const prefixes = {
	server: "srv",
	serverChannels: "cha",
	serverMembers: "mem",
	channelMembers: "cem",
	messages: "msg",
	pinnedMessages: "pms",
	reactions: "rct",
	users: "usr",

	attachment: "atc",
} satisfies Record<keyof Schema["tables"] | string, string>

export function newId(prefix: keyof typeof prefixes): string {
	return [prefixes[prefix], nanoid(16)].join("_")
}

export const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
