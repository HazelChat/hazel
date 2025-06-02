import type { Doc } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { createEffect, createSignal, on } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { createQuery } from "./convex"

const audio = new Audio("/sounds/notification02.mp3")

export const NotificationManager = (props: { children: JSX.Element }) => {
	const notification = createQuery(api.me.getLatestNotifcation)

	const [prevNotification, setPrevNotifications] = createSignal<Doc<"notifications">>()

	createEffect(
		on(
			notification,
			(currentNotification) => {
				if (
					!prevNotification()?._id ||
					!currentNotification?._id ||
					prevNotification()?._id === currentNotification._id
				) {
					if (currentNotification) {
						setPrevNotifications(currentNotification)
					}
					return
				}

				audio.currentTime = 0
				audio.volume = 0.5
				audio.play()

				setPrevNotifications(currentNotification)
			},
			{ defer: true },
		),
	)

	return <>{props.children}</>
}
