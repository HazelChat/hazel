export { messageActor } from "./actors/message-actor"
export type { AgentStep, MessageActorState } from "./actors/message-actor"
export { registry } from "./registry"
export type { Registry } from "./registry"

// Auth exports
export type { AuthenticatedClient, UserClient, BotClient, ActorConnectParams } from "./auth"
export { validateToken, getConfig, loadConfigFromEnv } from "./auth"
export type { TokenValidationConfig } from "./auth"
