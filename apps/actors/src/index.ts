import { registry } from "@hazel/actors"

import { createHandler } from "@rivetkit/cloudflare-workers"

const { handler, ActorHandler } = createHandler(registry)
export { handler as default, ActorHandler }
