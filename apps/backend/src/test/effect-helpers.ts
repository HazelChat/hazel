import { ConfigProvider, ServiceMap } from "effect"

export const serviceShape = <T extends ServiceMap.Service.Any>(shape: unknown) =>
	shape as ServiceMap.Service.Shape<T>

export const configLayer = (values: Record<string, unknown>) =>
	ConfigProvider.layer(ConfigProvider.fromUnknown(values))
