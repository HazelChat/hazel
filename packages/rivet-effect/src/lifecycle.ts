import { Cause, Effect, Exit } from "effect"
import type {
	CreateContext,
	WakeContext,
	DestroyContext,
	SleepContext,
	StateChangeContext,
	BeforeConnectContext,
	ConnectContext,
	DisconnectContext,
	CreateConnStateContext,
	BeforeActionResponseContext,
	CreateVarsContext,
	RequestContext,
	WebSocketContext,
	Conn,
	UniversalWebSocket,
} from "rivetkit"
import type { YieldWrap } from "effect/Utils"
import { provideActorContext } from "./actor.ts"
import { runPromise, runPromiseExit } from "./runtime.ts"

const runWithContext = <A, E, R>(context: unknown, effect: Effect.Effect<A, E, R>): Promise<A> =>
	runPromise(provideActorContext(effect, context), context)

const runWithContextExit = <A, E, R>(
	context: unknown,
	effect: Effect.Effect<A, E, R>,
): Promise<Exit.Exit<A, E>> => runPromiseExit(provideActorContext(effect, context), context)

export namespace OnCreate {
	export function effect<TState, TInput, AEff = void>(
		genFn: (
			c: CreateContext<TState, TInput, undefined>,
			input: TInput,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: CreateContext<TState, TInput, undefined>,
		input: TInput,
	) => Promise<AEff> {
		return (c, input) => {
			const gen = genFn(c, input)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnWake {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: WakeContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: WakeContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	) => Promise<AEff> {
		return (c) => {
			const gen = genFn(c)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace Run {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: WakeContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: WakeContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	) => Promise<AEff> {
		return (c) => {
			const gen = genFn(c)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnDestroy {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: DestroyContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: DestroyContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
	) => Promise<AEff> {
		return (c) => {
			const gen = genFn(c)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnSleep {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: SleepContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: SleepContext<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	) => Promise<AEff> {
		return (c) => {
			const gen = genFn(c)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnStateChange {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
	>(
		genFn: (
			c: StateChangeContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
			newState: TState,
		) => Generator<YieldWrap<Effect.Effect<any, never, any>>, void, never>,
	): (
		c: StateChangeContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		newState: TState,
	) => void {
		return (c, newState) => {
			const gen = genFn(c, newState)
			void runWithContextExit(c, Effect.gen(() => gen)).then((exit) => {
				if (Exit.isFailure(exit)) {
					c.log.error({
						msg: "onStateChange effect failed",
						cause: Cause.pretty(exit.cause),
					})
				}
			})
		}
	}
}

export namespace OnBeforeConnect {
	export function effect<
		TState,
		TConnParams,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: BeforeConnectContext<TState, TVars, TInput, undefined>,
			params: TConnParams,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: BeforeConnectContext<TState, TVars, TInput, undefined>,
		params: TConnParams,
	) => Promise<AEff> {
		return (c, params) => {
			const gen = genFn(c, params)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnConnect {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: ConnectContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
			conn: Conn<TState, TConnParams, TConnState, TVars, TInput, undefined>,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: ConnectContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		conn: Conn<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	) => Promise<AEff> {
		return (c, conn) => {
			const gen = genFn(c, conn)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnDisconnect {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: DisconnectContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
			conn: Conn<TState, TConnParams, TConnState, TVars, TInput, undefined>,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: DisconnectContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		conn: Conn<TState, TConnParams, TConnState, TVars, TInput, undefined>,
	) => Promise<AEff> {
		return (c, conn) => {
			const gen = genFn(c, conn)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace CreateConnState {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
	>(
		genFn: (
			c: CreateConnStateContext<TState, TVars, TInput, undefined>,
			params: TConnParams,
		) => Generator<
			YieldWrap<Effect.Effect<any, any, any>>,
			TConnState,
			never
		>,
	): (
		c: CreateConnStateContext<TState, TVars, TInput, undefined>,
		params: TConnParams,
	) => Promise<TConnState> {
		return (c, params) => {
			const gen = genFn(c, params)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnBeforeActionResponse {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		Out = any,
	>(
		genFn: (
			c: BeforeActionResponseContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
			name: string,
			args: unknown[],
			output: Out,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, Out, never>,
	): (
		c: BeforeActionResponseContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		name: string,
		args: unknown[],
		output: Out,
	) => Promise<Out> {
		return (c, name, args, output) => {
			const gen = genFn(c, name, args, output)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace CreateState {
	export function effect<TState, TInput>(
		genFn: (
			c: CreateContext<TState, TInput, undefined>,
			input: TInput,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, TState, never>,
	): (
		c: CreateContext<TState, TInput, undefined>,
		input: TInput,
	) => Promise<TState> {
		return (c, input) => {
			const gen = genFn(c, input)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace CreateVars {
	export function effect<TState, TVars, TInput>(
		genFn: (
			c: CreateVarsContext<TState, TInput, undefined>,
			driverCtx: unknown,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, TVars, never>,
	): (
		c: CreateVarsContext<TState, TInput, undefined>,
		driverCtx: unknown,
	) => Promise<TVars> {
		return (c, driverCtx) => {
			const gen = genFn(c, driverCtx)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnRequest {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
	>(
		genFn: (
			c: RequestContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
			request: Request,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, Response, never>,
	): (
		c: RequestContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		request: Request,
	) => Promise<Response> {
		return (c, request) => {
			const gen = genFn(c, request)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}

export namespace OnWebSocket {
	export function effect<
		TState,
		TConnParams,
		TConnState,
		TVars,
		TInput,
		AEff = void,
	>(
		genFn: (
			c: WebSocketContext<
				TState,
				TConnParams,
				TConnState,
				TVars,
				TInput,
				undefined
			>,
			websocket: UniversalWebSocket,
		) => Generator<YieldWrap<Effect.Effect<any, any, any>>, AEff, never>,
	): (
		c: WebSocketContext<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			undefined
		>,
		websocket: UniversalWebSocket,
	) => Promise<AEff> {
		return (c, websocket) => {
			const gen = genFn(c, websocket)
			return runWithContext(c, Effect.gen(() => gen))
		}
	}
}
