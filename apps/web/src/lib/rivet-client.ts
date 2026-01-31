import { createClient } from "rivetkit/client"
import type { Registry } from "@hazel/actors"

const RIVET_URL = import.meta.env.VITE_RIVET_URL || "http://localhost:6420"

/**
 * Typed RivetKit client for interacting with message actors.
 *
 * @example
 * ```typescript
 * import { rivetClient } from "~/lib/rivet-client"
 *
 * const actor = rivetClient.message.getOrCreate([messageId])
 * const conn = actor.connect()
 *
 * conn.on("textChunk", ({ chunk }) => console.log(chunk))
 * await conn.start({ model: "claude-3" })
 * ```
 */
export const rivetClient = createClient<Registry>(RIVET_URL)
