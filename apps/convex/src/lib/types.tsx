import type { Doc } from "convex-hazel/_generated/dataModel"

export type Message = Doc<"messages"> & {
	author: Doc<"users">
}
