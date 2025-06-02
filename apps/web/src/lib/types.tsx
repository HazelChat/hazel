import type { Doc } from "@hazel/backend"

export type Message = Doc<"messages"> & {
	author: Doc<"users">
}
