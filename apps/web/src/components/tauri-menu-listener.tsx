import { useEffect } from "react"
import { useAtomSet } from "@effect/atom-react"
import { getTauriEvent, type TauriEventApi } from "@hazel/desktop/bridge"
import { useNavigate } from "@tanstack/react-router"
import { modalAtomFamily } from "~/atoms/modal-atoms"
import { checkForUpdates, tauriUpdateStateAtom } from "~/atoms/tauri-update-atoms"
import { useOrganization } from "~/hooks/use-organization"
import { isTauri } from "~/lib/tauri"

export function TauriMenuListener() {
	const navigate = useNavigate()
	const { slug } = useOrganization()
	const setUpdateState = useAtomSet(tauriUpdateStateAtom)
	const setNewChannelModal = useAtomSet(modalAtomFamily("new-channel"))
	const setInviteModal = useAtomSet(modalAtomFamily("email-invite"))

	useEffect(() => {
		if (!isTauri()) return

		const event: TauriEventApi | undefined = getTauriEvent()
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
				checkForUpdates(setUpdateState)
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
