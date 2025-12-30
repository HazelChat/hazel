import type { Conn } from "../conn/mod";
import type { AnyDatabaseProvider } from "../database";
import type { ActorInstance } from "../instance/mod";
import { ConnContext } from "./conn";

/**
 * Context for raw HTTP request handlers (onRequest).
 */
export class RequestContext<
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
	TDatabase extends AnyDatabaseProvider,
> extends ConnContext<
	TState,
	TConnParams,
	TConnState,
	TVars,
	TInput,
	TDatabase
> {
	/**
	 * The incoming HTTP request.
	 * May be undefined for request contexts initiated without a direct HTTP request.
	 */
	public readonly request: Request | undefined;

	/**
	 * @internal
	 */
	constructor(
		actor: ActorInstance<
			TState,
			TConnParams,
			TConnState,
			TVars,
			TInput,
			TDatabase
		>,
		conn: Conn<TState, TConnParams, TConnState, TVars, TInput, TDatabase>,
		request?: Request,
	) {
		super(actor, conn);
		this.request = request;
	}
}
