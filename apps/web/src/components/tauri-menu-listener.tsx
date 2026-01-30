import { useEffect } from "react"
import { useAtomSet } from "@effect-atom/atom-react"
import { useNavigate } from "@tanstack/react-router"
import { modalAtomFamily } from "~/atoms/modal-atoms"
import { checkForUpdatesManually, tauriUpdateStateAtom } from "~/atoms/tauri-update-atoms"
import { useOrganization } from "~/hooks/use-organization"
import { runtime } from "~/lib/services/common/runtime"
import { isTauri } from "~/lib/tauri"

type EventApi = typeof import("@tauri-apps/api/event")

export function TauriMenuListener() {
	const navigate = useNavigate()
	const { slug } = useOrganization()
	const setUpdateState = useAtomSet(tauriUpdateStateAtom)
	const setNewChannelModal = useAtomSet(modalAtomFamily("new-channel"))
	const setInviteModal = useAtomSet(modalAtomFamily("email-invite"))

	useEffect(() => {
		if (!isTauri()) return

		const event: EventApi | undefined = (window as any).__TAURI__?.event
		if (!event) {
			console.warn("[TauriMenuListener] Tauri event API not available")
			return
		}

		const unlisteners: (() => void)[] = []

		event
			.listen("menu-open-settings", () => {
				navigate({ to: "/$orgSlug/my-settings/desktop", params: { orgSlug: slug } })
			})
			.then((fn) => unlisteners.push(fn))

		event
			.listen("menu-check-updates", () => {
				runtime.runFork(checkForUpdatesManually(setUpdateState))
			})
			.then((fn) => unlisteners.push(fn))

		event
			.listen("menu-new-channel", () => {
				setNewChannelModal((prev) => ({ ...prev, isOpen: true }))
			})
			.then((fn) => unlisteners.push(fn))

		event
			.listen("menu-invite", () => {
				setInviteModal((prev) => ({ ...prev, isOpen: true }))
			})
			.then((fn) => unlisteners.push(fn))

		return () => {
			unlisteners.forEach((fn) => fn())
		}
	}, [navigate, slug, setUpdateState, setNewChannelModal, setInviteModal])

	return null
}
