export default {
	providers: [
		{
			domain: process.env.VITE_CLERK_FRONTEND_API_URL,
			applicationID: "convex",
		},
	],
}
