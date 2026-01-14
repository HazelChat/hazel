/**
 * Authenticated fetch client for Electric SQL
 *
 * Handles both Tauri desktop (Bearer token) and web (cookies) authentication.
 * Uses shared auth-fetch logic for consistency.
 */
import { authenticatedFetch } from "./auth-fetch"

export const electricFetchClient = authenticatedFetch
