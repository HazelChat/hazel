import type { ReactNode } from "react"
import { usePresence } from "~/hooks/use-presence"

interface PresenceProviderProps {
	children: ReactNode
}

export function PresenceProvider({ children }: PresenceProviderProps) {
	usePresence()
	return <>{children}</>
}
