import { type HMSPeer, selectVideoTrackByID } from "@100mslive/hms-video-store"
import { Toggle } from "@ark-ui/solid"
import type { Id } from "@hazel/backend"
import { createFileRoute } from "@tanstack/solid-router"
import { For, Show, createSignal, onMount } from "solid-js"
import { Button, buttonVariants } from "~/components/ui/button"
import { TextField } from "~/components/ui/text-field"
import { hmsActions, hmsStore, useCallManager } from "~/lib/hms/use-video-manager"
export const Route = createFileRoute("/_protected/_app/$serverId/video")({
	component: RouteComponent,
})

function RouteComponent() {
	const params = Route.useParams()
	const {
		isConnected,
		peers,
		joinCall,
		leaveCall,
		setLocalAudio,
		setLocalVideo,
		localAudioEnabled,
		localVideoEnabled,
	} = useCallManager({ serverId: params().serverId as Id<"servers"> })
	const [roomCode, setRoomCode] = createSignal("ahf-hxjo-caw")

	const handleJoinCall = async () => {
		if (roomCode()) {
			await joinCall({ roomCode: roomCode() })
		}
	}

	return (
		<div class="flex min-h-screen flex-col">
			<Show when={!isConnected()}>
				<div class="flex items-center gap-2 border-b p-4">
					<TextField
						type="text"
						placeholder="Room Code"
						value={roomCode()}
						onInput={(e) => setRoomCode(e.currentTarget.value)}
					/>

					<Button onClick={handleJoinCall} disabled={!roomCode() || isConnected()}>
						Join Call
					</Button>
				</div>
			</Show>
			<div class="border-b p-4">
				<h1 class="font-semibold text-lg">Video Call - {roomCode()}</h1>
				<p>Status: {isConnected() ? "Connected" : "Disconnected"}</p>
			</div>

			<div class="grid flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-3">
				<div class="grid gap-4 md:col-span-2 md:grid-cols-2">
					<Show
						when={peers.length > 0}
						fallback={
							<>
								<div class="relative flex aspect-video items-center justify-center rounded-lg bg-muted">
									<p class="text-muted-foreground">Local Video</p>
									{/* Video elements and logic will go here */}
								</div>
								<div class="relative flex aspect-video items-center justify-center rounded-lg bg-muted">
									<p class="text-muted-foreground">Remote Video</p>
									{/* Video elements and logic will go here */}
								</div>
							</>
						}
					>
						<For each={peers}>{(peer) => <VideoComponent peer={peer} />}</For>
					</Show>
				</div>
				<div class="border-l p-4">
					<h3 class="mb-2 font-semibold">Peers ({peers.length})</h3>
					<ul class="space-y-1 text-sm">
						<For each={peers}>
							{(peer) => (
								<li>
									{peer.name} ({peer.isLocal ? "You" : "Remote"})
								</li>
							)}
						</For>
					</ul>
				</div>
			</div>
			<div class="flex items-center justify-center gap-2 border-t p-4 sm:gap-4">
				<Toggle.Root
					class={buttonVariants({
						intent: "outline",
					})}
					pressed={localAudioEnabled()}
					onPressedChange={setLocalAudio}
					disabled={!isConnected()}
				>
					<Show when={localAudioEnabled()} fallback={"Mute Mic"}>
						On Mic
					</Show>
				</Toggle.Root>
				<Toggle.Root
					class={buttonVariants({
						intent: "outline",
					})}
					pressed={localVideoEnabled()}
					onPressedChange={setLocalVideo}
					disabled={!isConnected()}
				>
					<Show when={localVideoEnabled()} fallback={"Video Off"}>
						On Video
					</Show>
				</Toggle.Root>

				<Button intent="destructive" onClick={leaveCall} disabled={!isConnected()}>
					Leave Call
				</Button>
			</div>
		</div>
	)
}

const VideoComponent = (props: { peer: HMSPeer }) => {
	let videoElement: HTMLVideoElement | undefined
	onMount(() => {
		hmsStore.subscribe((track) => {
			if (!track || !videoElement) {
				return
			}
			if (track.enabled) {
				hmsActions.attachVideo(track.id, videoElement)
			} else {
				hmsActions.detachVideo(track.id, videoElement)
			}
		}, selectVideoTrackByID(props.peer.videoTrack))
	})
	return (
		<div class="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
			<div class="absolute inset-0 flex items-center justify-center text-muted-foreground">
				{props.peer.name}
			</div>
			<video ref={videoElement} class="z-10 h-full w-full" muted playsinline autoplay />
		</div>
	)
}
