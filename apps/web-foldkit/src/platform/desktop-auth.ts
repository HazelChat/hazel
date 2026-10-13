import { desktopClient } from "@hazel/auth/contract"
import { type DesktopAuth, layerVault, makeDesktopAuth } from "@hazel/auth/desktop"
import { getTauriCore, getTauriDeepLink, getTauriOpener } from "@hazel/desktop/bridge"
import { BrowserLogin } from "@yielded/auth"
import { layerCryptoWeb } from "@yielded/crypto/WebCrypto"
import { Context, Effect, Layer, ManagedRuntime, Schema } from "effect"
import { FetchHttpClient } from "effect/http"

/**
 * Desktop sign-in (`@hazel/auth/desktop`) on Tauri: the session lives in the OS keychain (Rust
 * `auth_vault_*` commands), sign-in opens the system browser at `/auth/desktop`, and the
 * browser hands back through the `com.hazel.app://auth/callback` deep link.
 */

const unavailable = (reason: "unavailable" | "storage" = "unavailable") =>
	BrowserLogin.PlatformError.make({ reason })

/** One JSON record in the OS keychain; the Rust side never interprets it. */
const KeychainStore = {
	read: Effect.tryPromise({
		try: async () => {
			const core = getTauriCore()
			if (core === undefined) throw new Error("Tauri core unavailable")
			return await core.invoke<string | null>("auth_vault_read")
		},
		catch: () => unavailable("storage"),
	}),
	write: (record: string) =>
		Effect.tryPromise({
			try: async () => {
				const core = getTauriCore()
				if (core === undefined) throw new Error("Tauri core unavailable")
				await core.invoke("auth_vault_write", { record })
			},
			catch: () => unavailable("storage"),
		}),
}

/** Only the registered callback, with exactly its query; anything else is ignored. */
const isCallback = (url: string) => url.startsWith(`${desktopClient.returnUrl}?`)

/**
 * Opens the hosted page in the system browser and waits (up to 10 minutes) for the deep
 * link back. A callback that arrived before `open` (cold start) is used first.
 */
export const BrowserLive = Layer.effect(
	BrowserLogin.Browser,
	Effect.gen(function* () {
		const queued: Array<{ url: string; at: number }> = []
		let receive: ((url: string) => void) | undefined

		const capture = (urls: ReadonlyArray<string>) => {
			for (const url of urls) {
				if (!isCallback(url)) continue
				if (receive !== undefined) receive(url)
				else if (!queued.some((entry) => entry.url === url) && queued.length < 8)
					queued.push({ url, at: Date.now() })
			}
		}

		const deepLink = getTauriDeepLink()
		if (deepLink !== undefined) {
			yield* Effect.acquireRelease(
				Effect.promise(() => deepLink.onOpenUrl(capture)),
				(unlisten) => Effect.sync(unlisten),
			)
			const initial = yield* Effect.promise(() => deepLink.getCurrent()).pipe(
				Effect.orElseSucceed(() => null),
			)
			if (initial !== null) capture(initial)
		}

		return BrowserLogin.Browser.of({
			open: ({ url }) =>
				Effect.gen(function* () {
					const json = yield* KeychainStore.read
					if (json === null) return yield* Effect.fail(unavailable("storage"))
					const record = yield* Schema.decodeEffect(
						Schema.fromJsonString(BrowserLogin.VaultRecord),
					)(json).pipe(Effect.mapError(() => unavailable("storage")))
					const attempt = record.attempt
					if (attempt === undefined) return yield* Effect.fail(unavailable("storage"))
					const matches = (callback: string) =>
						new URL(callback).searchParams.get("state") === attempt.state
					return yield* Effect.callback<string, BrowserLogin.PlatformError>((resume) => {
						if (receive !== undefined) {
							resume(Effect.fail(BrowserLogin.PlatformError.make({ reason: "busy" })))
							return
						}
						let active = true
						const finish = (result: Effect.Effect<string, BrowserLogin.PlatformError>) => {
							if (!active) return
							active = false
							receive = undefined
							resume(result)
						}
						receive = (callbackUrl) => {
							if (matches(callbackUrl)) finish(Effect.succeed(callbackUrl))
						}
						const pending = queued.find(
							(entry) => Date.now() - entry.at < 10 * 60_000 && matches(entry.url),
						)
						queued.length = 0
						if (pending !== undefined) receive(pending.url)
						else {
							const opener = getTauriOpener()
							if (opener === undefined) finish(Effect.fail(unavailable()))
							else opener.openUrl(url).catch(() => finish(Effect.fail(unavailable())))
						}
						return Effect.sync(() => {
							active = false
							receive = undefined
						})
					}).pipe(
						Effect.timeout("10 minutes"),
						Effect.catchTag("TimeoutError", () =>
							Effect.fail(BrowserLogin.PlatformError.make({ reason: "expired" })),
						),
					)
				}),
		})
	}),
)

export class DesktopAuthService extends Context.Service<DesktopAuthService, DesktopAuth>()(
	"@hazel/web-foldkit/DesktopAuthService",
) {}

/** The web app's handoff page: where the API and web app live for this build. */
const hostedUrl = () => {
	const appOrigin = import.meta.env.VITE_APP_URL || "https://app.hazel.sh"
	return `${new URL(appOrigin).origin}/auth/desktop`
}

const DesktopAuthLive = Layer.effect(
	DesktopAuthService,
	makeDesktopAuth({
		apiOrigin: import.meta.env.VITE_BACKEND_URL || "http://localhost:3003",
		hostedUrl: hostedUrl(),
	}),
).pipe(
	Layer.provide(Layer.mergeAll(BrowserLive, layerVault(KeychainStore), layerCryptoWeb)),
	Layer.provide(FetchHttpClient.layer),
	// The desktop session travels in headers: never cookies, never redirects.
	Layer.provide(Layer.succeed(FetchHttpClient.RequestInit, { credentials: "omit", redirect: "error" })),
)

/** Built on first use and kept for the app's life (the deep link listener lives with it). */
let runtime: ManagedRuntime.ManagedRuntime<DesktopAuthService, unknown> | undefined

export const runDesktopAuth = <A, E>(f: (auth: DesktopAuth) => Effect.Effect<A, E>): Effect.Effect<A, E> =>
	Effect.suspend(() => {
		runtime ??= ManagedRuntime.make(DesktopAuthLive)
		const current = runtime
		return Effect.flatMap(
			Effect.promise(() => current.runPromise(Effect.service(DesktopAuthService))),
			f,
		)
	})

/** The session credential for API requests (`Authorization: Bearer`), or `null` signed out. */
export const desktopSessionBearer = (): Promise<string | null> =>
	Effect.runPromise(runDesktopAuth((auth) => auth.credential).pipe(Effect.orElseSucceed(() => null)))
