import { defineConfig } from "drizzle-kit"

export default defineConfig({
	schema: "./src/schema/streams.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
