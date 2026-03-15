import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as ServiceMap from "effect/ServiceMap"

export class EnvVars extends ServiceMap.Service<EnvVars>()("EnvVars", {
	make: Effect.gen(function* () {
		return {
			IS_DEV: yield* Config.boolean("IS_DEV").pipe(Config.withDefault(false)),
			DATABASE_URL: yield* Config.redacted("DATABASE_URL"),
		} as const
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
