import { registry } from "@hazel/actors"

import { createHandler } from "@rivetkit/cloudflare-workers"

const { handler, ActorHandler } = createHandler(registry, { managerPath: "/" })
export { handler as default, ActorHandler }
