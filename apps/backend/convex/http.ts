import { httpRouter } from "convex/server"
import { httpAction } from "./_generated/server"

const http = httpRouter()

http.route({
	path: "/store",
	method: "PUT",
	handler: httpAction(async (ctx, request) => {
		// Step 1: Store the file
		const blob = await request.blob()
		const storageId = await ctx.storage.store(blob)

		return new Response(storageId, {
			status: 200,
			// CORS headers
			headers: new Headers({
				// e.g. https://mywebsite.com, configured on your Convex dashboard
				"Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN!,
				Vary: "origin",
			}),
		})
	}),
})

export default http
