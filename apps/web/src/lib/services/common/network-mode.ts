import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as ServiceMap from "effect/ServiceMap"
import * as Stream from "effect/Stream"
import * as SubscriptionRef from "effect/SubscriptionRef"

export class NetworkMonitor extends ServiceMap.Service<NetworkMonitor>()("NetworkMonitor", {
	make: Effect.gen(function* () {
		const latch = yield* Effect.makeLatch(true)

		const ref = yield* SubscriptionRef.make<boolean>(window.navigator.onLine)
		yield* Stream.async<boolean>((emit) => {
			const onlineHandler = () => emit(Effect.succeed(Chunk.of(true)))
			const offlineHandler = () => emit(Effect.succeed(Chunk.of(false)))
			window.addEventListener("online", onlineHandler)
			window.addEventListener("offline", offlineHandler)
		}).pipe(
			Stream.tap((isOnline) =>
				(isOnline ? latch.open : latch.close).pipe(
					Effect.zipRight(SubscriptionRef.update(ref, () => isOnline)),
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
