import { Atom, Registry, scheduleTask } from "@effect-atom/atom-react"
import { runtimeLayer } from "./services/common/runtime"

export const appRegistry = Registry.make({ scheduleTask })

const sharedAtomRuntime = Atom.runtime(runtimeLayer)

appRegistry.mount(sharedAtomRuntime)
