import { Cause, Effect, Exit, Layer, ManagedRuntime, Option, Runtime } from "effect"
import { RuntimeExecutionError } from "./errors.ts"

export type AnyManagedRuntime = ManagedRuntime.ManagedRuntime<any, any>

export const ActorManagedRuntimeSymbol = Symbol.for("@hazel/rivet-effect/runtime")

const DefaultRuntime = ManagedRuntime.make(Layer.empty)

type RuntimeCarrier = {
	[ActorManagedRuntimeSymbol]?: AnyManagedRuntime
}

const RuntimeContextMap = new WeakMap<object, AnyManagedRuntime>()

export const setManagedRuntime = (context: unknown, runtime: AnyManagedRuntime): void => {
	if (typeof context === "object" && context !== null) {
		RuntimeContextMap.set(context, runtime)

		const carrier = context as RuntimeCarrier
		try {
			if (Object.prototype.hasOwnProperty.call(carrier, ActorManagedRuntimeSymbol)) {
				carrier[ActorManagedRuntimeSymbol] = runtime
				return
			}

			if (Object.isExtensible(carrier)) {
				Object.defineProperty(carrier, ActorManagedRuntimeSymbol, {
					configurable: true,
					enumerable: false,
					writable: true,
					value: runtime,
				})
			}
		} catch {
			// Some runtime context objects may be non-extensible/proxied; WeakMap path still works.
		}
	}
}

export const getManagedRuntime = (context: unknown): AnyManagedRuntime | undefined => {
	if (typeof context === "object" && context !== null) {
		const fromCarrier = (context as RuntimeCarrier)[ActorManagedRuntimeSymbol]
		if (fromCarrier) return fromCarrier
		return RuntimeContextMap.get(context)
	}
}

const runWithCurrentRuntime = <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> =>
	DefaultRuntime.runPromise(
		Effect.runtime<R>().pipe(
			Effect.map((runtime) => Runtime.runPromise(runtime)),
			Effect.flatMap((run) => Effect.promise(() => run(effect))),
		) as Effect.Effect<A, never, never>,
	).catch((error) =>
		Promise.reject(
			new RuntimeExecutionError({
				message: "Failed to execute effect with current runtime",
				operation: "runWithCurrentRuntime",
				cause: error,
			}),
		),
	)

const runExitWithCurrentRuntime = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
): Promise<Exit.Exit<A, E>> =>
	DefaultRuntime.runPromise(
		Effect.runtime<R>().pipe(
			Effect.map((runtime) => Runtime.runPromiseExit(runtime)),
			Effect.flatMap((run) => Effect.promise(() => run(effect))),
		) as Effect.Effect<Exit.Exit<A, E>, never, never>,
	).catch((error) =>
		Promise.reject(
			new RuntimeExecutionError({
				message: "Failed to execute effect exit with current runtime",
				operation: "runExitWithCurrentRuntime",
				cause: error,
			}),
		),
	)

const throwFromCause = <E>(cause: Cause.Cause<E>): never => {
	const failure = Cause.failureOption(cause)
	if (Option.isSome(failure)) {
		throw failure.value
	}

	const defect = Cause.dieOption(cause)
	if (Option.isSome(defect)) {
		throw defect.value instanceof Error ? defect.value : new Error(String(defect.value))
	}

	throw new Error(Cause.pretty(cause))
}

export const runPromise = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
	context?: unknown,
): Promise<A> =>
	runPromiseExit(effect, context).then((exit) => {
		if (Exit.isSuccess(exit)) {
			return exit.value
		}
		return throwFromCause(exit.cause)
	})

export const runPromiseExit = <A, E, R>(
	effect: Effect.Effect<A, E, R>,
	context?: unknown,
): Promise<Exit.Exit<A, E>> => {
	const runtime = getManagedRuntime(context)
	const execution: Promise<Exit.Exit<A, E>> = runtime
		? runtime.runPromiseExit(effect as Effect.Effect<A, E, never>)
		: runExitWithCurrentRuntime(effect)

	return execution.catch((error) =>
		Exit.die(
			new RuntimeExecutionError({
				message: "Runtime execution failed unexpectedly",
				operation: "runPromiseExit",
				cause: error,
			}),
		),
	)
}
