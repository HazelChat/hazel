import { HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from "@effect/platform"
import { ConfigProvider, Layer, Redacted, String } from "effect"

import { addCorsHeaders, oldUploadHandler } from "./http/old-upload"

import { Database, MessageService } from "@maki-chat/backend-shared/services"
import { AuthorizationLive } from "./authorization.live"
import { HttpLive } from "./http"
import { Jose } from "./services/jose"

import { PgClient } from "@effect/sql-pg"
import { SqlCassandra } from "@maki-chat/backend-shared"

const SqlLiveCass = SqlCassandra.layer({
	contactPoints: ["127.0.0.1"],
	localDataCenter: "datacenter1",
	keyspace: "chat",
	clientOptions: {
		queryOptions: {
			prepare: false,
		},
		pooling: {
			maxRequestsPerConnection: 1,
		},
	},

	transformQueryNames: String.camelToSnake,
	transformResultNames: String.snakeToCamel,
})

const Live = HttpLive.pipe(
	Layer.provide(AuthorizationLive),
	Layer.provide(Jose.Default),
	Layer.provide(MessageService.Default),
	// Layer.provide(SqlLiveCass),
)

const HttpApiScalarLayer = HttpApiScalar.layer().pipe(Layer.provide(Live))

declare global {
	var env: Env
	var waitUntil: (promise: Promise<any>) => void
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		Object.assign(globalThis, {
			env,
			waitUntil: (promise: Promise<any>) => ctx.waitUntil(promise),
		})

		const url = new URL(request.url)
		if (url.pathname === "/upload") {
			return await oldUploadHandler(request)!
		}

		// Assets server for DEV
		if (url.pathname.startsWith("/assets/")) {
			if (request.method === "OPTIONS") {
				return addCorsHeaders(new Response(null, { status: 204 }))
			}

			const key = url.pathname.replace("/assets/", "")
			if (!key) {
				return addCorsHeaders(new Response("Missing file key in URL path", { status: 400 }))
			}
			const object = await env.FILE_BUCKET.get(key)
			if (object === null) {
				return addCorsHeaders(new Response("Object Not Found", { status: 404 }))
			}

			const headers = new Headers()
			object.writeHttpMetadata(headers)
			headers.set("etag", object.httpEtag)
			// Add content disposition if you want downloads to use original filename (requires storing it)
			// headers.set('Content-Disposition', `inline; filename="${originalFilenameStoredSomewhere}"`);
			return addCorsHeaders(
				new Response(object.body, {
					headers,
				}),
			)
		}

		const PgLive = PgClient.layer({
			url: Redacted.make(env.HYPERDRIVE.connectionString),

			transformQueryNames: String.camelToSnake,
			transformResultNames: String.snakeToCamel,
		})

		const DatabaseLive = Database.layer({
			url: Redacted.make(env.HYPERDRIVE.connectionString),
			ssl: false,
		})

		const ConfigLayer = Layer.setConfigProvider(
			ConfigProvider.fromJson({ ...env, DATABASE_URL: env.HYPERDRIVE.connectionString }),
		)

		const { dispose, handler } = HttpApiBuilder.toWebHandler(
			Layer.mergeAll(Live, HttpApiScalarLayer, HttpServer.layerContext).pipe(
				Layer.provide(ConfigLayer),
				Layer.provide(PgLive),
				Layer.provide(DatabaseLive),
			),
			{
				middleware: HttpMiddleware.cors(),
			},
		)

		const res = await handler(request)

		ctx.waitUntil(dispose())

		return res
	},
} satisfies ExportedHandler<Env>
