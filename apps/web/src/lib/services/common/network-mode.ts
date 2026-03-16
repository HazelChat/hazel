import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Latch from "effect/Latch"
import * as Queue from "effect/Queue"
import * as ServiceMap from "effect/ServiceMap"
import * as Stream from "effect/Stream"
import * as SubscriptionRef from "effect/SubscriptionRef"

export class NetworkMonitor extends ServiceMap.Service<NetworkMonitor>()("NetworkMonitor", {
	make: Effect.gen(function* () {
		const latch = yield* Latch.make(true)

		const ref = yield* SubscriptionRef.make<boolean>(window.navigator.onLine)
		yield* Stream.callback<boolean>((queue) =>
			Effect.gen(function* () {
				const onlineHandler = () => {
					Effect.runFork(Queue.offer(queue, true))
				}
				const offlineHandler = () => {
					Effect.runFork(Queue.offer(queue, false))
				}
				window.addEventListener("online", onlineHandler)
				window.addEventListener("offline", offlineHandler)
				yield* Effect.addFinalizer(() =>
					Effect.sync(() => {
						window.removeEventListener("online", onlineHandler)
						window.removeEventListener("offline", offlineHandler)
					}),
				)
				// Keep scope alive
				yield* Effect.never
			}),
		).pipe(
			Stream.tap((isOnline) =>
				Effect.andThen(
					isOnline ? latch.open : latch.close,
					SubscriptionRef.update(ref, () => isOnline),
				),
			),
			Stream.runDrain,
			Effect.forkScoped,
		)

		return { latch, ref }
	}),
}) {
	static readonly layer = Layer.effect(this, this.make)
}
