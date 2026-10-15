import { createClient } from "rivetkit/client"
import type { Registry } from "@hazel/actors"
import { getAccessToken } from "~/lib/access-token"

export { getAccessToken }

const RIVET_URL = import.meta.env.VITE_RIVET_URL || "http://localhost:6420"

/** The Rivet actor client; actor connections pass the Hazel access token as `params.token`. */
export const rivetClient = createClient<Registry>(RIVET_URL)
