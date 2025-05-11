import { HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from "@effect/platform"
import { Layer } from "effect"

import { oldUploadHandler } from "./api/old-upload"
import { RootLive } from "./http"

import { MakiApi } from "@maki-chat/api-schema"

const MakiApiLive = HttpApiBuilder.api(MakiApi).pipe(Layer.provide(RootLive))

const Live = MakiApiLive.pipe()

const HttpApiScalarLayer = HttpApiScalar.layer().pipe(Layer.provide(Live))

declare global {
	var env: Env
	var waitUntil: (promise: Promise<any>) => Promise<void>
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		Object.assign(globalThis, {
			env,
			waitUntil: ctx.waitUntil,
		})

		const url = new URL(request.url)
		if (url.pathname === "/upload") {
			return await oldUploadHandler(request)!
		}

		const { dispose, handler } = HttpApiBuilder.toWebHandler(
			Layer.mergeAll(Live, HttpApiScalarLayer, HttpServer.layerContext),
			{
				middleware: HttpMiddleware.cors(),
			},
		)

		const res = await handler(request)

		ctx.waitUntil(dispose())

		return res
	},
} satisfies ExportedHandler<Env>
