const clientId = process.env.WORKOS_CLIENT_ID

export default {
	providers: [
		{
			type: "customJwt",
			applicationID: "convex",
			issuer: "https://api.workos.com",
			jwks: `https://api.workos.com/sso/jwks/${clientId}`,
			algorithm: "RS256",
		},
		{
			type: "customJwt",
			issuer: `https://api.workos.com/user_management/${clientId}`,
			algorithm: "RS256",
			jwks: `https://api.workos.com/sso/jwks/${clientId}`,
			applicationID: "convex",
		},
	],
}
