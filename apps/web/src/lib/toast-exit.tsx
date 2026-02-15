import { Cause, Chunk, Exit, Option } from "effect"
import { type ExternalToast, toast } from "sonner"

import {
	type CommonAppError,
	DEFAULT_ERROR_MESSAGE,
	getCommonErrorMessage,
	getUserFriendlyError,
	isCommonAppError,
	type UserErrorMessage,
} from "./error-messages"

// =============================================================================
// Type Utilities
// =============================================================================

/**
 * String literal union of all common error tags.
 * Derived from the CommonAppError type for single source of truth.
 */
type CommonErrorTag = CommonAppError["_tag"]

/**
 * Extracts the _tag literal types from a union of tagged errors,
 * excluding common errors that are already handled.
 */
type NonCommonErrorTags<E> = E extends { _tag: infer T extends string }
	? T extends CommonErrorTag
		? never
		: T
	: never

/**
 * Extracts ALL _tag literal types from a union of tagged errors.
 */
type AllErrorTags<E> = E extends { _tag: infer T extends string } ? T : never

/**
 * Gets the error message using custom handlers first, then common handlers.
 */
function getErrorMessage<E extends { _tag: string }>(
	error: E,
	// biome-ignore lint/suspicious/noExplicitAny: Runtime type checking handles safety
	customHandlers?: Partial<Record<string, (error: any) => UserErrorMessage>>,
): UserErrorMessage {
	// Check custom handlers first (for non-common errors)
	if (customHandlers && error._tag in customHandlers) {
		const handler = customHandlers[error._tag]
		if (handler) {
			return handler(error)
		}
	}

	// Fall back to common error handler
	if (isCommonAppError(error)) {
		return getCommonErrorMessage(error)
	}

	// Should not reach here if types are correct, but fallback just in case
	return DEFAULT_ERROR_MESSAGE
}

// =============================================================================
// Builder Pattern API
// =============================================================================

/**
 * Builder type for exitToast - chainable API for Exit toast handling.
 *
 * @template A - Success value type
 * @template E - Error union type (must have _tag)
 * @template HandledErrors - Accumulates handled error tags
 */
export type ExitToastBuilder<A, E, HandledErrors extends string> = {
	/**
	 * Callback executed after successful exit.
	 */
	onSuccess(fn: (value: A) => void): ExitToastBuilder<A, E, HandledErrors>

	/**
	 * Success toast message (string or function returning string).
	 */
	successMessage(msg: string | ((value: A) => string)): ExitToastBuilder<A, E, HandledErrors>

	/**
	 * Handle a specific error tag with custom message.
	 * Removes the tag from unhandled errors tracking.
	 */
	onErrorTag<Tag extends Exclude<AllErrorTags<E>, HandledErrors | CommonErrorTag>>(
		tag: Tag,
		handler: (error: Extract<E, { _tag: Tag }>) => UserErrorMessage,
	): ExitToastBuilder<A, E, HandledErrors | Tag>

	/**
	 * Override handling for common errors (optional).
	 */
	onCommonErrorTag<Tag extends AllErrorTags<E> & CommonErrorTag>(
		tag: Tag,
		handler: (error: Extract<E, { _tag: Tag }>) => UserErrorMessage,
	): ExitToastBuilder<A, E, HandledErrors>

	/**
	 * Catch-all handler for remaining errors.
	 */
	onError(
		handler: (error: Exclude<E, { _tag: HandledErrors | CommonErrorTag }>) => UserErrorMessage,
	): ExitToastBuilder<A, E, AllErrorTags<E>>

	/**
	 * Add retry action to error toast.
	 */
	withRetry(options: { label?: string; onRetry: () => void }): ExitToastBuilder<A, E, HandledErrors>

	/**
	 * Show detailed error description from Cause.pretty().
	 */
	showErrorDescription(): ExitToastBuilder<A, E, HandledErrors>

	/**
	 * Execute the builder and show appropriate toast.
	 * Only available when all non-common errors are handled.
	 */
	run: NonCommonErrorTags<E> extends HandledErrors ? () => void : BuilderNotReady<E, HandledErrors>
}

/**
 * Helper type that shows which errors still need handlers.
 */
type BuilderNotReady<E, HandledErrors extends string> = {
	readonly _unhandledErrors: Exclude<NonCommonErrorTags<E>, HandledErrors>
	readonly _message: "Missing handlers for non-common errors. Use onErrorTag() to handle them."
}

/**
 * Builder type for exitToastAsync - chainable API with loading state support.
 */
export type ExitToastAsyncBuilder<A, E, HandledErrors extends string> = {
	/**
	 * Loading toast message shown while awaiting the promise.
	 */
	loading(message: string): ExitToastAsyncBuilder<A, E, HandledErrors>

	/**
	 * Callback executed after successful exit.
	 */
	onSuccess(fn: (value: A) => void): ExitToastAsyncBuilder<A, E, HandledErrors>

	/**
	 * Success toast message (string or function returning string).
	 */
	successMessage(msg: string | ((value: A) => string)): ExitToastAsyncBuilder<A, E, HandledErrors>

	/**
	 * Handle a specific error tag with custom message.
	 */
	onErrorTag<Tag extends Exclude<AllErrorTags<E>, HandledErrors | CommonErrorTag>>(
		tag: Tag,
		handler: (error: Extract<E, { _tag: Tag }>) => UserErrorMessage,
	): ExitToastAsyncBuilder<A, E, HandledErrors | Tag>

	/**
	 * Override handling for common errors (optional).
	 */
	onCommonErrorTag<Tag extends AllErrorTags<E> & CommonErrorTag>(
		tag: Tag,
		handler: (error: Extract<E, { _tag: Tag }>) => UserErrorMessage,
	): ExitToastAsyncBuilder<A, E, HandledErrors>

	/**
	 * Catch-all handler for remaining errors.
	 */
	onError(
		handler: (error: Exclude<E, { _tag: HandledErrors | CommonErrorTag }>) => UserErrorMessage,
	): ExitToastAsyncBuilder<A, E, AllErrorTags<E>>

	/**
	 * Add retry action to error toast.
	 */
	withRetry(options: { label?: string; onRetry: () => void }): ExitToastAsyncBuilder<A, E, HandledErrors>

	/**
	 * Show detailed error description from Cause.pretty().
	 */
	showErrorDescription(): ExitToastAsyncBuilder<A, E, HandledErrors>

	/**
	 * Execute the builder, await the promise, and show appropriate toast.
	 * Returns the Exit for further handling.
	 */
	run: NonCommonErrorTags<E> extends HandledErrors
		? () => Promise<Exit.Exit<A, E>>
		: BuilderNotReady<E, HandledErrors>
}

/**
 * Internal state for the builder.
 */
interface BuilderState<A, E> {
	onSuccessFn?: (value: A) => void
	successMsg?: string | ((value: A) => string)
	errorHandlers: Record<string, (error: E) => UserErrorMessage>
	retryOptions?: { label?: string; onRetry: () => void }
	showDescription: boolean
	loadingMsg?: string
}

/**
 * Executes the toast logic for an Exit.
 */
function executeToast<A, E extends { _tag: string }>(
	exit: Exit.Exit<A, E>,
	state: BuilderState<A, E>,
	loadingToastId?: string | number,
): void {
	Exit.match(exit, {
		onSuccess: (value) => {
			if (state.successMsg) {
				const msg =
					typeof state.successMsg === "function" ? state.successMsg(value) : state.successMsg
				if (loadingToastId !== undefined) {
					toast.success(msg, { id: loadingToastId })
				} else {
					toast.success(msg)
				}
			} else if (loadingToastId !== undefined) {
				toast.dismiss(loadingToastId)
			}
			state.onSuccessFn?.(value)
		},
		onFailure: (cause) => {
			const toastOptions: ExternalToast = {}
			if (loadingToastId !== undefined) {
				toastOptions.id = loadingToastId
			}

			const failures = Cause.failures(cause)
			const firstFailure = Chunk.head(failures)

			let userError: UserErrorMessage

			if (Option.isSome(firstFailure)) {
				userError = getErrorMessage(firstFailure.value, state.errorHandlers)
			} else {
				userError = getUserFriendlyError(cause)
			}

			if (userError.description) {
				toastOptions.description = userError.description
			}

			if (state.showDescription) {
				toastOptions.description = Cause.pretty(cause)
			}

			if (state.retryOptions && userError.isRetryable) {
				toastOptions.action = {
					label: state.retryOptions.label ?? "Retry",
					onClick: state.retryOptions.onRetry,
				}
			}

			toast.error(userError.title, toastOptions)
		},
	})
}

/**
 * Creates a builder for Exit toast handling.
 * Provides a chainable API consistent with Result.builder.
 *
 * @example
 * ```tsx
 * // Simple usage with only common errors
 * exitToast(exit)
 *   .successMessage("Saved!")
 *   .run()
 *
 * // With custom error handling
 * exitToast(exit)
 *   .onSuccess(() => onOpenChange(false))
 *   .successMessage("Channel deleted successfully")
 *   .onErrorTag("ChannelNotFoundError", () => ({
 *     title: "Channel not found",
 *     description: "This channel may have been deleted.",
 *     isRetryable: false,
 *   }))
 *   .run()
 *
 * // Multiple custom errors
 * exitToast(exit)
 *   .successMessage(`Subscribed to ${repo}`)
 *   .onErrorTag("GitHubSubscriptionExistsError", () => ({
 *     title: "Already subscribed",
 *     description: "This channel is already subscribed.",
 *     isRetryable: false,
 *   }))
 *   .onErrorTag("GitHubNotConnectedError", () => ({
 *     title: "GitHub not connected",
 *     description: "Connect GitHub in settings first.",
 *     isRetryable: false,
 *   }))
 *   .run()
 * ```
 */
export function exitToast<A, E extends { _tag: string }>(
	exit: Exit.Exit<A, E>,
): ExitToastBuilder<A, E, never> {
	const state: BuilderState<A, E> = {
		errorHandlers: {},
		showDescription: false,
	}

	const builder: ExitToastBuilder<A, E, never> = {
		onSuccess(fn) {
			state.onSuccessFn = fn
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		successMessage(msg) {
			state.successMsg = msg
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onErrorTag(tag, handler) {
			// biome-ignore lint/suspicious/noExplicitAny: Handler types are checked at call site
			state.errorHandlers[tag] = handler as any
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onCommonErrorTag(tag, handler) {
			// biome-ignore lint/suspicious/noExplicitAny: Handler types are checked at call site
			state.errorHandlers[tag] = handler as any
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onError(handler) {
			// biome-ignore lint/suspicious/noExplicitAny: Handler types are checked at call site
			state.errorHandlers["*"] = handler as any
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		withRetry(options) {
			state.retryOptions = options
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		showErrorDescription() {
			state.showDescription = true
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		// biome-ignore lint/suspicious/noExplicitAny: run() type depends on HandledErrors
		run: (() => executeToast(exit, state)) as any,
	}

	return builder
}

/**
 * Creates a builder for async Exit toast handling with loading state.
 * Provides a chainable API with loading toast support.
 *
 * @example
 * ```tsx
 * // With loading state
 * const exit = await exitToastAsync(createChannel({ name }))
 *   .loading("Creating channel...")
 *   .onSuccess((result) => {
 *     navigate({ to: `/c/$channelId`, params: { channelId: result.id } })
 *     onOpenChange(false)
 *   })
 *   .successMessage("Channel created successfully")
 *   .run()
 *
 * // Without loading (shows toast only on result)
 * await exitToastAsync(deleteItem({ id }))
 *   .successMessage("Deleted")
 *   .run()
 * ```
 */
export function exitToastAsync<A, E extends { _tag: string }>(
	promiseExit: Promise<Exit.Exit<A, E>>,
): ExitToastAsyncBuilder<A, E, never> {
	const state: BuilderState<A, E> = {
		errorHandlers: {},
		showDescription: false,
	}

	const builder: ExitToastAsyncBuilder<A, E, never> = {
		loading(message) {
			state.loadingMsg = message
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onSuccess(fn) {
			state.onSuccessFn = fn
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		successMessage(msg) {
			state.successMsg = msg
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onErrorTag(tag, handler) {
			// biome-ignore lint/suspicious/noExplicitAny: Handler types are checked at call site
			state.errorHandlers[tag] = handler as any
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onCommonErrorTag(tag, handler) {
			// biome-ignore lint/suspicious/noExplicitAny: Handler types are checked at call site
			state.errorHandlers[tag] = handler as any
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		onError(handler) {
			// biome-ignore lint/suspicious/noExplicitAny: Handler types are checked at call site
			state.errorHandlers["*"] = handler as any
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		withRetry(options) {
			state.retryOptions = options
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		showErrorDescription() {
			state.showDescription = true
			// biome-ignore lint/suspicious/noExplicitAny: Builder pattern requires flexible return types
			return builder as any
		},
		// biome-ignore lint/suspicious/noExplicitAny: run() type depends on HandledErrors
		run: (async () => {
			const loadingToastId = state.loadingMsg ? toast.loading(state.loadingMsg) : undefined
			const exit = await promiseExit
			executeToast(exit, state, loadingToastId)
			return exit
		}) as any,
	}

	return builder
}
