import { ConfigProvider, Effect, Layer, ServiceMap } from "effect"

export const buildServiceLayer = <I, S, E, R>(
	service: ServiceMap.Service<I, S> & {
		readonly make: Effect.Effect<S, E, R>
	},
) => Layer.effect(service, service.make)

export const serviceEffect = <I, S, A, E, R>(
	service: ServiceMap.Service<I, S>,
	f: (implementation: S) => Effect.Effect<A, E, R>,
) => service.use(f)

export const serviceShape = <T extends ServiceMap.Service.Any>(
	shape: Partial<ServiceMap.Service.Shape<T>>,
) => shape as ServiceMap.Service.Shape<T>

export const configLayer = (values: Record<string, unknown>) =>
	ConfigProvider.layer(ConfigProvider.fromUnknown(values))
