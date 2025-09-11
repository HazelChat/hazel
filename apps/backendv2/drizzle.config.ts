import { defineConfig } from "drizzle-kit"

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema/index.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	casing: "camelCase",
	verbose: true,
	strict: true,
	migrations: {
		table: "drizzle_migrations",
		schema: "public",
	},
})
