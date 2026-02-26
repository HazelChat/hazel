import { useEffect } from "react"
import { useAtomSet } from "@effect-atom/atom-react"
import { useNavigate } from "@tanstack/react-router"
import { modalAtomFamily } from "~/atoms/modal-atoms"
import { checkForUpdates, desktopUpdateStateAtom } from "~/atoms/desktop-update-atoms"
import { useOrganization } from "~/hooks/use-organization"
import { onDesktopMessage } from "~/lib/desktop-bridge"
import { isDesktopRuntime } from "~/lib/desktop-runtime"

export function DesktopMenuListener() {
	const navigate = useNavigate()
	const { slug } = useOrganization()
	const setUpdateState = useAtomSet(desktopUpdateStateAtom)
	const setNewChannelModal = useAtomSet(modalAtomFamily("new-channel"))
	const setInviteModal = useAtomSet(modalAtomFamily("email-invite"))

	useEffect(() => {
		if (!isDesktopRuntime()) return

		const off = onDesktopMessage("menu.action", ({ action }) => {
			switch (action) {
				case "settings":
					navigate({ to: "/$orgSlug/my-settings/desktop", params: { orgSlug: slug } })
					break
				case "check_updates":
					checkForUpdates(setUpdateState)
					break
				case "new_channel":
					setNewChannelModal((prev) => ({ ...prev, isOpen: true }))
					break
				case "invite":
					setInviteModal((prev) => ({ ...prev, isOpen: true }))
					break
			}
		})

		return off
	}, [navigate, slug, setUpdateState, setNewChannelModal, setInviteModal])

	return null
}
