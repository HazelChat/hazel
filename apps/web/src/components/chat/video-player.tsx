import {
	BufferingIndicator,
	Container,
	Controls,
	FullscreenButton,
	MuteButton,
	PlayButton,
	Popover,
	Time,
	TimeSlider,
	Tooltip,
	VolumeSlider,
	createPlayer,
	usePlayer,
} from "@videojs/react"
import { Video, videoFeatures } from "@videojs/react/video"
import type { ReactNode } from "react"
import { IconDownload } from "../icons/icon-download"

const Player = createPlayer({ features: videoFeatures })

// ============================================================================
// Icon State Classes (from Video.js minimal skin)
// These use data-* attributes set by Video.js primitives to toggle icon visibility
// ============================================================================

const iconCls =
	"block [grid-area:1/1] size-4.5 drop-shadow-[0_1px_0_oklch(0_0_0/0.25)] transition-discrete transition-[display,opacity] duration-150 ease-out"

const iconState = {
	play: {
		button: "group",
		restart: "hidden opacity-0 group-data-ended:block group-data-ended:opacity-100",
		play: "hidden opacity-0 group-not-data-ended:group-data-paused:block group-not-data-ended:group-data-paused:opacity-100",
		pause: "hidden opacity-0 group-not-data-paused:group-not-data-ended:block group-not-data-paused:group-not-data-ended:opacity-100",
	},
	mute: {
		button: "group",
		volumeOff: "hidden opacity-0 group-data-muted:block group-data-muted:opacity-100",
		volumeLow:
			"hidden opacity-0 group-not-data-muted:group-data-[volume-level=low]:block group-not-data-muted:group-data-[volume-level=low]:opacity-100",
		volumeHigh:
			"hidden opacity-0 group-not-data-muted:group-not-data-[volume-level=low]:block group-not-data-muted:group-not-data-[volume-level=low]:opacity-100",
	},
	fullscreen: {
		button: "group",
		enter: "hidden opacity-0 group-not-data-fullscreen:block group-not-data-fullscreen:opacity-100",
		exit: "hidden opacity-0 group-data-fullscreen:block group-data-fullscreen:opacity-100",
	},
}

// ============================================================================
// Tailwind Skin Classes (from Video.js minimal tailwind skin)
// ============================================================================

const btnCls =
	"grid w-[2.375rem] aspect-square bg-transparent rounded-lg items-center justify-center shrink-0 border-none cursor-pointer select-none text-center outline-2 outline-transparent -outline-offset-2 font-medium transition-[background-color,color,outline-offset,scale] duration-150 ease-out focus-visible:outline-current focus-visible:outline-offset-2 text-inherit hover:text-current/80 active:scale-90"

const sliderCls = {
	root: "group/slider relative flex flex-1 items-center justify-center rounded-full outline-none data-[orientation=horizontal]:min-w-20 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-5 data-[orientation=vertical]:w-5 data-[orientation=vertical]:h-[4.5rem]",
	track: "relative isolate overflow-hidden bg-current/20 rounded-[inherit] select-none shadow-[0_0_0_1px_oklch(0_0_0/0.05)] data-[orientation=horizontal]:w-full data-[orientation=horizontal]:h-0.75 data-[orientation=vertical]:w-0.75 data-[orientation=vertical]:h-full",
	fill: "absolute rounded-[inherit] pointer-events-none bg-current data-[orientation=horizontal]:inset-y-0 data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:w-(--media-slider-fill,0) data-[orientation=vertical]:inset-x-0 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:h-(--media-slider-fill,0)",
	buffer: "absolute rounded-[inherit] pointer-events-none bg-current/20 duration-250 ease-out data-[orientation=horizontal]:inset-y-0 data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:transition-[width] data-[orientation=horizontal]:w-(--media-slider-buffer,0) data-[orientation=vertical]:inset-x-0 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:transition-[height] data-[orientation=vertical]:h-(--media-slider-buffer)",
	thumb: "z-10 absolute size-3 -translate-x-1/2 -translate-y-1/2 bg-current rounded-full shadow-[0_0_0_1px_oklch(0_0_0/0.1),0_1px_3px_0_oklch(0_0_0/0.15),0_1px_2px_-1px_oklch(0_0_0/0.15)] transition-[opacity,scale,outline-offset] duration-150 ease-out select-none outline-2 outline-transparent -outline-offset-2 focus-visible:outline-current focus-visible:outline-offset-2 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:left-(--media-slider-fill,0) data-[orientation=vertical]:left-1/2 data-[orientation=vertical]:top-[calc(100%-var(--media-slider-fill,0))] opacity-0 scale-70 origin-center group-hover/slider:opacity-100 group-hover/slider:scale-100 group-focus-within/slider:opacity-100 group-focus-within/slider:scale-100",
}

const timeCls = {
	group: "flex items-center gap-1",
	current: "hidden tabular-nums @md/media-controls:inline",
	separator: "hidden @md/media-controls:inline @md/media-controls:text-white/50",
	duration: "tabular-nums @md/media-controls:text-current/60",
	controls: "flex flex-row-reverse items-center flex-1 gap-3 @md/media-controls:flex-row",
}

const controlsCls =
	"peer/controls @container/media-controls flex items-center [--media-controls-current-shadow-color:oklch(from_currentColor_0_0_0/clamp(0,calc((l-0.5)*0.5),0.25))] text-shadow-[0_0_1px_var(--media-controls-current-shadow-color)] absolute bottom-0 inset-x-0 pt-8 px-1.5 pb-1.5 gap-2 text-white z-10 will-change-[translate,filter,opacity] transition-[translate,filter,opacity] ease-out delay-0 duration-75 not-data-visible:opacity-0 not-data-visible:translate-y-full not-data-visible:blur-sm not-data-visible:pointer-events-none not-data-visible:delay-500 not-data-visible:duration-500 motion-reduce:not-data-visible:duration-100 motion-reduce:not-data-visible:translate-y-0 motion-reduce:not-data-visible:blur-none @sm/media-root:pt-10 @sm/media-root:px-3 @sm/media-root:pb-3 @sm/media-root:gap-3.5"

const rootCls =
	"block relative isolate @container/media-root rounded-(--media-border-radius,0.75rem) font-[Inter_Variable,Inter,ui-sans-serif,system-ui,sans-serif] text-[0.8125rem] leading-normal subpixel-antialiased **:box-border **:m-0 [&_button]:font-[inherit] motion-safe:[interpolate-size:allow-keywords] bg-black after:absolute after:pointer-events-none after:rounded-[inherit] after:z-10 after:inset-0 after:ring-1 after:ring-inset after:ring-black/15 dark:after:ring-white/15 [&_video]:block [&_video]:w-full [&_video]:h-full [&_video]:rounded-[inherit] [&:fullscreen]:rounded-none"

const overlayCls =
	"absolute inset-0 flex flex-col items-start pointer-events-none rounded-[inherit] opacity-0 bg-linear-to-t from-black/70 via-black/50 via-[7.5rem] to-transparent backdrop-blur-none backdrop-saturate-120 backdrop-brightness-90 transition-[opacity,backdrop-filter] ease-out duration-500 delay-500 peer-data-visible/controls:opacity-100 peer-data-visible/controls:duration-150 peer-data-visible/controls:delay-0 motion-reduce:duration-100"

const bufferingCls =
	"absolute inset-0 hidden items-center justify-center pointer-events-none text-white data-visible:flex"

const tooltipCls =
	"m-0 border-0 text-inherit overflow-visible transition-[transform,scale,opacity,filter] duration-200 data-starting-style:opacity-0 data-starting-style:scale-0 data-starting-style:blur-sm data-ending-style:opacity-0 data-ending-style:scale-0 data-ending-style:blur-sm data-[side=top]:origin-bottom px-2 py-1 rounded-sm shadow-md shadow-black/10 bg-white/10 backdrop-blur-3xl backdrop-saturate-150 backdrop-brightness-90 text-[0.75rem] whitespace-nowrap [--media-tooltip-side-offset:0.5rem]"

const volumePopupCls =
	"m-0 border-0 text-inherit overflow-visible transition-[transform,scale,opacity,filter] duration-200 data-starting-style:opacity-0 data-starting-style:scale-0 data-starting-style:blur-sm data-ending-style:opacity-0 data-ending-style:scale-0 data-ending-style:blur-sm data-[side=top]:origin-bottom [--media-popover-side-offset:0.5rem] p-1 bg-transparent"

const buttonGroupCls = "flex items-center gap-[0.075rem] @2xl/media-root:gap-0.5"

// ============================================================================
// Minimal Icons (inline SVGs matching Video.js minimal icon set)
// ============================================================================

function PlayIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="m13.473 10.476-6.845 4.256a1.697 1.697 0 0 1-2.364-.547 1.77 1.77 0 0 1-.264-.93v-8.51C4 3.78 4.768 3 5.714 3c.324 0 .64.093.914.268l6.845 4.255a1.763 1.763 0 0 1 0 2.953"
			/>
		</svg>
	)
}

function PauseIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<rect width={4} height={12} x={3} y={3} fill="currentColor" rx={1.75} />
			<rect width={4} height={12} x={11} y={3} fill="currentColor" rx={1.75} />
		</svg>
	)
}

function RestartIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="M9 17a8 8 0 0 1-8-8h1.5a6.5 6.5 0 1 0 1.43-4.07l1.643 1.643A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"
			/>
			<path
				fill="currentColor"
				d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"
			/>
		</svg>
	)
}

function VolumeHighIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"
			/>
			<path
				fill="currentColor"
				d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
			/>
		</svg>
	)
}

function VolumeLowIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
			/>
		</svg>
	)
}

function VolumeOffIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"
			/>
		</svg>
	)
}

function FullscreenEnterIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="M15.25 2a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V3.5h-3.75a.75.75 0 0 1-.743-.648L10 2.75a.75.75 0 0 1 .75-.75z"
			/>
			<path
				fill="currentColor"
				d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM2.75 10a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 .743.648L8 15.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"
			/>
			<path
				fill="currentColor"
				d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"
			/>
		</svg>
	)
}

function FullscreenExitIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="none"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<path
				fill="currentColor"
				d="M10.75 2a.75.75 0 0 1 .75.75V6.5h3.75a.75.75 0 0 1 .743.648L16 7.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"
			/>
			<path
				fill="currentColor"
				d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM7.25 10a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V11.5H2.75a.75.75 0 0 1-.743-.648L2 10.75a.75.75 0 0 1 .75-.75z"
			/>
			<path
				fill="currentColor"
				d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"
			/>
		</svg>
	)
}

function SpinnerIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			fill="currentColor"
			viewBox="0 0 18 18"
			aria-hidden="true"
			className={className}
		>
			<rect width={2} height={5} x={8} y={0.5} opacity={0.5} rx={1}>
				<animate
					attributeName="opacity"
					begin="0s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect
				width={2}
				height={5}
				x={12.243}
				y={2.257}
				opacity={0.45}
				rx={1}
				transform="rotate(45 13.243 4.757)"
			>
				<animate
					attributeName="opacity"
					begin="0.125s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect width={5} height={2} x={12.5} y={8} opacity={0.4} rx={1}>
				<animate
					attributeName="opacity"
					begin="0.25s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect
				width={5}
				height={2}
				x={10.743}
				y={12.243}
				opacity={0.35}
				rx={1}
				transform="rotate(45 13.243 13.243)"
			>
				<animate
					attributeName="opacity"
					begin="0.375s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect width={2} height={5} x={8} y={12.5} opacity={0.3} rx={1}>
				<animate
					attributeName="opacity"
					begin="0.5s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect
				width={2}
				height={5}
				x={3.757}
				y={10.743}
				opacity={0.25}
				rx={1}
				transform="rotate(45 4.757 13.243)"
			>
				<animate
					attributeName="opacity"
					begin="0.625s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect width={5} height={2} x={0.5} y={8} opacity={0.15} rx={1}>
				<animate
					attributeName="opacity"
					begin="0.75s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
			<rect
				width={5}
				height={2}
				x={2.257}
				y={3.757}
				opacity={0.1}
				rx={1}
				transform="rotate(45 4.757 4.757)"
			>
				<animate
					attributeName="opacity"
					begin="0.875s"
					calcMode="linear"
					dur="1s"
					repeatCount="indefinite"
					values="1;0"
				/>
			</rect>
		</svg>
	)
}

// ============================================================================
// Dynamic Labels (state-aware text for tooltips)
// ============================================================================

function PlayLabel() {
	const paused = usePlayer((s) => Boolean(s.paused))
	if (usePlayer((s) => Boolean(s.ended))) return <>Replay</>
	return paused ? <>Play</> : <>Pause</>
}

function FullscreenLabel() {
	return usePlayer((s) => Boolean(s.fullscreen)) ? <>Exit fullscreen</> : <>Enter fullscreen</>
}

// ============================================================================
// Custom Chat Video Skin
// ============================================================================

function ChatVideoSkin({ children, onDownload }: { children: ReactNode; onDownload: () => void }) {
	return (
		<Container className={rootCls}>
			{children}

			{/* Buffering spinner */}
			<BufferingIndicator className={bufferingCls}>
				<SpinnerIcon className={iconCls} />
			</BufferingIndicator>

			{/* Controls bar */}
			<Controls.Root data-controls="" className={controlsCls}>
				{/* Play button */}
				<span className={buttonGroupCls}>
					<Tooltip.Root side="top">
						<Tooltip.Trigger
							render={
								<PlayButton
									render={(props) => (
										<button
											type="button"
											{...props}
											className={`${btnCls} ${iconState.play.button}`}
										>
											<RestartIcon className={`${iconCls} ${iconState.play.restart}`} />
											<PlayIcon className={`${iconCls} ${iconState.play.play}`} />
											<PauseIcon className={`${iconCls} ${iconState.play.pause}`} />
										</button>
									)}
								/>
							}
						/>
						<Tooltip.Popup className={tooltipCls}>
							<PlayLabel />
						</Tooltip.Popup>
					</Tooltip.Root>
				</span>

				{/* Time display + slider */}
				<span className={timeCls.controls}>
					<Time.Group className={timeCls.group}>
						<Time.Value type="current" className={timeCls.current} />
						<Time.Separator className={timeCls.separator} />
						<Time.Value type="duration" className={timeCls.duration} />
					</Time.Group>

					<TimeSlider.Root render={(props) => <div {...props} className={sliderCls.root} />}>
						<TimeSlider.Track render={(props) => <div {...props} className={sliderCls.track} />}>
							<TimeSlider.Fill
								render={(props) => <div {...props} className={sliderCls.fill} />}
							/>
							<TimeSlider.Buffer
								render={(props) => <div {...props} className={sliderCls.buffer} />}
							/>
						</TimeSlider.Track>
						<TimeSlider.Thumb
							render={(props) => <div {...props} className={sliderCls.thumb} />}
						/>
					</TimeSlider.Root>
				</span>

				{/* Right controls: mute, fullscreen, download */}
				<span className={buttonGroupCls}>
					{/* Mute button with volume popup */}
					<Popover.Root openOnHover delay={200} closeDelay={100} side="top">
						<Popover.Trigger
							render={
								<MuteButton
									render={(props) => (
										<button
											type="button"
											{...props}
											className={`${btnCls} ${iconState.mute.button}`}
										>
											<VolumeOffIcon
												className={`${iconCls} ${iconState.mute.volumeOff}`}
											/>
											<VolumeLowIcon
												className={`${iconCls} ${iconState.mute.volumeLow}`}
											/>
											<VolumeHighIcon
												className={`${iconCls} ${iconState.mute.volumeHigh}`}
											/>
										</button>
									)}
								/>
							}
						/>
						<Popover.Popup className={volumePopupCls}>
							<VolumeSlider.Root
								orientation="vertical"
								thumbAlignment="edge"
								render={(props) => <div {...props} className={sliderCls.root} />}
							>
								<VolumeSlider.Track
									render={(props) => <div {...props} className={sliderCls.track} />}
								>
									<VolumeSlider.Fill
										render={(props) => <div {...props} className={sliderCls.fill} />}
									/>
								</VolumeSlider.Track>
								<VolumeSlider.Thumb
									render={(props) => (
										<div
											{...props}
											className="z-10 absolute size-3 -translate-x-1/2 -translate-y-1/2 bg-current rounded-full shadow-[0_0_0_1px_oklch(0_0_0/0.1),0_1px_3px_0_oklch(0_0_0/0.15),0_1px_2px_-1px_oklch(0_0_0/0.15)] transition-[opacity,scale,outline-offset] duration-150 ease-out select-none outline-2 outline-transparent -outline-offset-2 focus-visible:outline-current focus-visible:outline-offset-2 data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:left-(--media-slider-fill,0) data-[orientation=vertical]:left-1/2 data-[orientation=vertical]:top-[calc(100%-var(--media-slider-fill,0))]"
										/>
									)}
								/>
							</VolumeSlider.Root>
						</Popover.Popup>
					</Popover.Root>

					{/* Fullscreen button */}
					<Tooltip.Root side="top">
						<Tooltip.Trigger
							render={
								<FullscreenButton
									render={(props) => (
										<button
											type="button"
											{...props}
											className={`${btnCls} ${iconState.fullscreen.button}`}
										>
											<FullscreenEnterIcon
												className={`${iconCls} ${iconState.fullscreen.enter}`}
											/>
											<FullscreenExitIcon
												className={`${iconCls} ${iconState.fullscreen.exit}`}
											/>
										</button>
									)}
								/>
							}
						/>
						<Tooltip.Popup className={tooltipCls}>
							<FullscreenLabel />
						</Tooltip.Popup>
					</Tooltip.Root>

					{/* Download button */}
					<Tooltip.Root side="top">
						<Tooltip.Trigger
							render={
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										onDownload()
									}}
									className={btnCls}
									aria-label="Download video"
								>
									<IconDownload className={iconCls} />
								</button>
							}
						/>
						<Tooltip.Popup className={tooltipCls}>Download</Tooltip.Popup>
					</Tooltip.Root>
				</span>
			</Controls.Root>

			{/* Gradient overlay behind controls */}
			<div className={overlayCls} />
		</Container>
	)
}

// ============================================================================
// Public API
// ============================================================================

interface VideoPlayerSimpleProps {
	src: string
	fileName: string
	onDownload: () => void
}

export function VideoPlayerSimple({ src, fileName, onDownload }: VideoPlayerSimpleProps) {
	return (
		<div className="group relative inline-block max-w-md">
			<Player.Provider>
				<ChatVideoSkin onDownload={onDownload}>
					<Video src={src} className="block max-h-80 w-full" playsInline />
				</ChatVideoSkin>
			</Player.Provider>
			<div className="mt-1.5 truncate font-medium text-muted-fg text-xs">{fileName}</div>
		</div>
	)
}
