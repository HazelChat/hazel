import type { ElectrobunConfig } from "electrobun"

const config: ElectrobunConfig = {
	app: {
		name: "Hazel",
		identifier: "com.hazel.app",
		version: "0.1.7",
		urlSchemes: ["hazel"],
	},
	build: {
		bun: {
			entrypoint: "src/bun/index.ts",
		},
		copy: {
			"../web/dist": "views/mainview",
		},
	},
	scripts: {
		preBuild: "build:web:desktop",
	},
	release: {
		baseUrl: "https://github.com/HazelChat/hazel/releases/latest/download",
	},
}

export default config
