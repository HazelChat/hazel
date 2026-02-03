import type { ReactNode } from "react"
import { usePresenceEffects } from "~/hooks/use-presence"

interface PresenceProviderProps {
	children: ReactNode
}

export function PresenceProvider({ children }: PresenceProviderProps) {
	usePresenceEffects()
	return <>{children}</>
}
