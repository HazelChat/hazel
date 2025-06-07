import {
	type HMSConfig,
	HMSReactiveStore,
	selectIsConnectedToRoom,
	selectIsLocalAudioEnabled,
	selectIsLocalVideoEnabled,
	selectPeers,
} from "@100mslive/hms-video-store"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/solid-query"
import { createEffect, createSignal, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { toaster } from "~/components/ui/toaster"
import { convexQuery } from "../convex-query"

const hms = new HMSReactiveStore()

hms.triggerOnSubscribe()
export const hmsActions = hms.getActions()
export const hmsStore = hms.getStore()

export function useCallManager(props: { serverId: Id<"servers"> }) {
	const meQuery = useQuery(() => ({
		...convexQuery(api.me.getUser, { serverId: props.serverId }),
	}))

	const [isConnected, setIsConnected] = createSignal(hmsStore.getState(selectIsConnectedToRoom))
	const [peers, setPeers] = createStore(hmsStore.getState(selectPeers))

	const [localAudioEnabled, setLocalAudioEnabled] = createSignal(
		hmsStore.getState(selectIsLocalAudioEnabled),
	)
	const [localVideoEnabled, setLocalVideoEnabled] = createSignal(
		hmsStore.getState(selectIsLocalVideoEnabled),
	)

	const joinCall = async ({ roomCode }: { roomCode: string }) => {
		try {
			if (!meQuery.data) {
				toaster.info({
					title: "Please sign in to join a call",
				})

				return
			}
			const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode })
			const config = {
				authToken,
				userName: meQuery.data.displayName,
			} satisfies HMSConfig
			await hmsActions.join(config)
		} catch (error) {
			console.error("Error joining call:", error)
		}
	}

	const leaveCall = async () => {
		try {
			await hmsActions.leave()
		} catch (error) {
			console.error("Error leaving call:", error)
		}
	}

	const setLocalAudio = async (enabled: boolean) => {
		try {
			await hmsActions.setLocalAudioEnabled(enabled)
		} catch (error) {
			console.error("Error setting local audio:", error)
		}
	}

	const setLocalVideo = async (enabled: boolean) => {
		try {
			await hmsActions.setLocalVideoEnabled(enabled)
		} catch (error) {
			console.error("Error setting local video:", error)
		}
	}

	createEffect(() => {
		const unsubscribe = hmsStore.subscribe((store) => {
			console.log(store)
			setIsConnected(!!selectIsConnectedToRoom(store))

			setLocalAudioEnabled(selectIsLocalAudioEnabled(store))
			setLocalVideoEnabled(selectIsLocalVideoEnabled(store))

			setPeers(selectPeers(store))
		})

		onCleanup(() => {
			unsubscribe()
		})
	})

	return {
		isConnected,
		peers,
		joinCall,
		leaveCall,
		hmsActions,

		setLocalAudio,
		localAudioEnabled,

		localVideoEnabled,
		setLocalVideo,
	}
}
