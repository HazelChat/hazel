import { ConfigProvider, Effect, Layer, ServiceMap } from "effect"

export const buildServiceLayer = <
	T extends ServiceMap.Service.Any & {
		readonly make: Effect.Effect<any, any, any>
	},
>(
	service: T,
) => Layer.effect(service, service.make)

export const serviceEffect = <T extends ServiceMap.Service.Any, A, E, R>(
	service: T,
	f: (implementation: ServiceMap.Service.Shape<T>) => Effect.Effect<A, E, R>,
) => service.use(f)

export const serviceShape = <T extends ServiceMap.Service.Any>(
	shape: Partial<ServiceMap.Service.Shape<T>>,
) => shape as ServiceMap.Service.Shape<T>

export const configLayer = (values: Record<string, unknown>) =>
	ConfigProvider.layer(ConfigProvider.fromUnknown(values))
