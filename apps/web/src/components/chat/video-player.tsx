import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react"
import { IconDownload } from "../icons/icon-download"
import { IconPlay } from "../icons/icon-play"
import IconVolume from "../icons/icon-volume"
import IconVolumeMute from "../icons/icon-volume-mute"

// ============================================================================
// Context and Types
// ============================================================================

interface VideoPlayerState {
	isPlaying: boolean
	isMuted: boolean
	isLoading: boolean
	isBuffering: boolean
	showControls: boolean
	isDragging: boolean
	currentTime: number
	duration: number
	progress: number
}

interface VideoPlayerActions {
	togglePlay: () => void
	toggleMute: () => void
	seek: (time: number) => void
	setIsDragging: (dragging: boolean) => void
	resetHideControlsTimer: () => void
}

interface VideoPlayerRefs {
	videoRef: React.RefObject<HTMLVideoElement | null>
	progressRef: React.RefObject<HTMLDivElement | null>
}

interface VideoPlayerContextValue {
	state: VideoPlayerState
	actions: VideoPlayerActions
	refs: VideoPlayerRefs
	src: string
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null)

function useVideoPlayer() {
	const context = useContext(VideoPlayerContext)
	if (!context) {
		throw new Error("VideoPlayer compound components must be used within VideoPlayer.Provider")
	}
	return context
}

// ============================================================================
// Provider Component
// ============================================================================

interface VideoPlayerProviderProps {
	src: string
	children: ReactNode
	/**
	 * Time in ms before controls auto-hide during playback
	 * @default 3000
	 */
	controlsHideDelay?: number
}

function VideoPlayerProvider({ src, children, controlsHideDelay = 3000 }: VideoPlayerProviderProps) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const progressRef = useRef<HTMLDivElement>(null)
	const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [isMuted, setIsMuted] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isBuffering, setIsBuffering] = useState(false)
	const [showControls, setShowControls] = useState(true)
	const [isDragging, setIsDragging] = useState(false)

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0

	// Hide controls after inactivity while playing
	const resetHideControlsTimer = useCallback(() => {
		if (hideControlsTimeoutRef.current) {
			clearTimeout(hideControlsTimeoutRef.current)
		}
		setShowControls(true)

		if (isPlaying && !isDragging) {
			hideControlsTimeoutRef.current = setTimeout(() => {
				setShowControls(false)
			}, controlsHideDelay)
		}
	}, [isPlaying, isDragging, controlsHideDelay])

	useEffect(() => {
		resetHideControlsTimer()
		return () => {
			if (hideControlsTimeoutRef.current) {
				clearTimeout(hideControlsTimeoutRef.current)
			}
		}
	}, [resetHideControlsTimer])

	// Video event handlers - these are applied to the video element
	useEffect(() => {
		const video = videoRef.current
		if (!video) return

		const handleLoadedMetadata = () => {
			setDuration(video.duration)
			setIsLoading(false)
		}

		const handleTimeUpdate = () => {
			if (!isDragging) {
				setCurrentTime(video.currentTime)
			}
		}

		const handleEnded = () => {
			setIsPlaying(false)
			setShowControls(true)
		}

		const handleWaiting = () => setIsBuffering(true)
		const handleCanPlay = () => setIsBuffering(false)

		video.addEventListener("loadedmetadata", handleLoadedMetadata)
		video.addEventListener("timeupdate", handleTimeUpdate)
		video.addEventListener("ended", handleEnded)
		video.addEventListener("waiting", handleWaiting)
		video.addEventListener("canplay", handleCanPlay)

		return () => {
			video.removeEventListener("loadedmetadata", handleLoadedMetadata)
			video.removeEventListener("timeupdate", handleTimeUpdate)
			video.removeEventListener("ended", handleEnded)
			video.removeEventListener("waiting", handleWaiting)
			video.removeEventListener("canplay", handleCanPlay)
		}
	}, [isDragging])

	const togglePlay = useCallback(() => {
		const video = videoRef.current
		if (!video) return

		if (isPlaying) {
			video.pause()
			setIsPlaying(false)
		} else {
			video.play()
			setIsPlaying(true)
		}
	}, [isPlaying])

	const toggleMute = useCallback(() => {
		const video = videoRef.current
		if (!video) return

		video.muted = !video.muted
		setIsMuted(video.muted)
	}, [])

	const seek = useCallback((time: number) => {
		const video = videoRef.current
		if (!video) return

		video.currentTime = time
		setCurrentTime(time)
	}, [])

	const contextValue = useMemo<VideoPlayerContextValue>(
		() => ({
			state: {
				isPlaying,
				isMuted,
				isLoading,
				isBuffering,
				showControls,
				isDragging,
				currentTime,
				duration,
				progress,
			},
			actions: {
				togglePlay,
				toggleMute,
				seek,
				setIsDragging,
				resetHideControlsTimer,
			},
			refs: {
				videoRef,
				progressRef,
			},
			src,
		}),
		[
			isPlaying,
			isMuted,
			isLoading,
			isBuffering,
			showControls,
			isDragging,
			currentTime,
			duration,
			progress,
			togglePlay,
			toggleMute,
			seek,
			resetHideControlsTimer,
			src,
		],
	)

	return <VideoPlayerContext.Provider value={contextValue}>{children}</VideoPlayerContext.Provider>
}

// ============================================================================
// Sub-Components
// ============================================================================

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins}:${secs.toString().padStart(2, "0")}`
}

interface ContainerProps {
	children: ReactNode
}

function Container({ children }: ContainerProps) {
	const { state, actions } = useVideoPlayer()

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: container for mouse tracking to show/hide controls
		<div
			className="relative overflow-hidden rounded-lg border border-border bg-black shadow-sm"
			onMouseMove={actions.resetHideControlsTimer}
			onMouseLeave={() => state.isPlaying && actions.resetHideControlsTimer()}
		>
			{children}
		</div>
	)
}

function Video() {
	const { refs, src, actions } = useVideoPlayer()

	return (
		// biome-ignore lint/a11y/useMediaCaption: video caption not required for chat attachments
		<video
			ref={refs.videoRef}
			src={src}
			className="block max-h-80 w-full"
			preload="metadata"
			playsInline
			onClick={actions.togglePlay}
		/>
	)
}

function LoadingOverlay() {
	const { state } = useVideoPlayer()

	if (!state.isLoading) return null

	return (
		<div className="absolute inset-0 flex items-center justify-center bg-black/40">
			<div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
		</div>
	)
}

function BufferingOverlay() {
	const { state } = useVideoPlayer()

	if (!state.isBuffering || state.isLoading) return null

	return (
		<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
		</div>
	)
}

function PlayOverlay() {
	const { state, actions } = useVideoPlayer()

	if (state.isPlaying || state.isLoading) return null

	return (
		<button
			type="button"
			onClick={actions.togglePlay}
			className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
			aria-label="Play video"
		>
			<div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-105">
				<IconPlay className="ml-0.5 size-6 text-gray-900" />
			</div>
		</button>
	)
}

interface ControlsProps {
	children: ReactNode
}

function Controls({ children }: ControlsProps) {
	const { state } = useVideoPlayer()

	return (
		<div
			className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-2 transition-opacity duration-200 ${
				state.showControls || !state.isPlaying ? "opacity-100" : "pointer-events-none opacity-0"
			}`}
		>
			{children}
		</div>
	)
}

function ProgressBar() {
	const { state, actions, refs } = useVideoPlayer()

	const handleProgressClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const progressBar = refs.progressRef.current
			if (!progressBar) return

			const rect = progressBar.getBoundingClientRect()
			const clickX = e.clientX - rect.left
			const percentage = Math.max(0, Math.min(1, clickX / rect.width))
			const newTime = percentage * state.duration

			actions.seek(newTime)
		},
		[state.duration, actions, refs],
	)

	const handleProgressDragStart = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault()
			actions.setIsDragging(true)
			handleProgressClick(e)
		},
		[handleProgressClick, actions],
	)

	// Drag handling effect
	useEffect(() => {
		if (!state.isDragging) return

		const handleMouseMove = (e: MouseEvent) => {
			const progressBar = refs.progressRef.current
			if (!progressBar) return

			const rect = progressBar.getBoundingClientRect()
			const clickX = e.clientX - rect.left
			const percentage = Math.max(0, Math.min(1, clickX / rect.width))
			const newTime = percentage * state.duration

			actions.seek(newTime)
		}

		const handleMouseUp = (e: MouseEvent) => {
			const progressBar = refs.progressRef.current
			if (!progressBar) return

			const rect = progressBar.getBoundingClientRect()
			const clickX = e.clientX - rect.left
			const percentage = Math.max(0, Math.min(1, clickX / rect.width))
			actions.seek(percentage * state.duration)

			actions.setIsDragging(false)
		}

		document.addEventListener("mousemove", handleMouseMove)
		document.addEventListener("mouseup", handleMouseUp)

		return () => {
			document.removeEventListener("mousemove", handleMouseMove)
			document.removeEventListener("mouseup", handleMouseUp)
		}
	}, [state.isDragging, state.duration, actions, refs])

	const handleProgressKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const step = state.duration * 0.05 // 5% of duration
			if (e.key === "ArrowRight" || e.key === "ArrowUp") {
				e.preventDefault()
				actions.seek(Math.min(state.duration, state.currentTime + step))
			} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
				e.preventDefault()
				actions.seek(Math.max(0, state.currentTime - step))
			}
		},
		[state.duration, state.currentTime, actions],
	)

	return (
		<div
			ref={refs.progressRef}
			className="group/progress mb-2 h-1 cursor-pointer rounded-full bg-white/30 transition-all hover:h-1.5"
			onClick={handleProgressClick}
			onMouseDown={handleProgressDragStart}
			onKeyDown={handleProgressKeyDown}
			role="slider"
			aria-label="Video progress"
			aria-valuenow={state.currentTime}
			aria-valuemin={0}
			aria-valuemax={state.duration}
			tabIndex={0}
		>
			<div
				className="relative h-full rounded-full bg-white transition-all"
				style={{ width: `${state.progress}%` }}
			>
				{/* Thumb indicator */}
				<div className="absolute top-1/2 right-0 size-3 -translate-y-1/2 translate-x-1/2 scale-0 rounded-full bg-white shadow-md transition-transform group-hover/progress:scale-100" />
			</div>
		</div>
	)
}

function ControlsRow({ children }: { children: ReactNode }) {
	return <div className="flex items-center gap-2">{children}</div>
}

function PlayPauseButton() {
	const { state, actions } = useVideoPlayer()

	return (
		<button
			type="button"
			onClick={actions.togglePlay}
			className="flex size-7 items-center justify-center rounded text-white transition-colors hover:bg-white/20"
			aria-label={state.isPlaying ? "Pause" : "Play"}
		>
			{state.isPlaying ? <PauseIcon className="size-4" /> : <IconPlay className="size-4" />}
		</button>
	)
}

function TimeDisplay() {
	const { state } = useVideoPlayer()

	return (
		<span className="min-w-[70px] font-mono text-white/90 text-xs">
			{formatTime(state.currentTime)} / {formatTime(state.duration)}
		</span>
	)
}

function Spacer() {
	return <div className="flex-1" />
}

function MuteButton() {
	const { state, actions } = useVideoPlayer()

	return (
		<button
			type="button"
			onClick={actions.toggleMute}
			className="flex size-7 items-center justify-center rounded text-white transition-colors hover:bg-white/20"
			aria-label={state.isMuted ? "Unmute" : "Mute"}
		>
			{state.isMuted ? <IconVolumeMute className="size-4" /> : <IconVolume className="size-4" />}
		</button>
	)
}

interface DownloadButtonProps {
	onClick: () => void
}

function DownloadButton({ onClick }: DownloadButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex size-7 items-center justify-center rounded text-white transition-colors hover:bg-white/20"
			aria-label="Download video"
		>
			<IconDownload className="size-4" />
		</button>
	)
}

interface FileNameProps {
	children: ReactNode
}

function FileName({ children }: FileNameProps) {
	return <div className="mt-1 truncate text-muted-fg text-xs">{children}</div>
}

// Simple pause icon (inline since we don't have one)
function PauseIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 18 18" fill="currentColor" className={className} aria-hidden="true">
			<title>Pause</title>
			<rect x="4" y="3" width="3.5" height="12" rx="1" />
			<rect x="10.5" y="3" width="3.5" height="12" rx="1" />
		</svg>
	)
}

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * VideoPlayer compound component for rendering video with custom controls.
 *
 * This component uses a shared context to manage video state, making it easy
 * to customize the layout and appearance of video controls.
 *
 * @example
 * ```tsx
 * <VideoPlayer.Provider src={videoUrl}>
 *   <VideoPlayer.Container>
 *     <VideoPlayer.Video />
 *     <VideoPlayer.LoadingOverlay />
 *     <VideoPlayer.BufferingOverlay />
 *     <VideoPlayer.PlayOverlay />
 *     <VideoPlayer.Controls>
 *       <VideoPlayer.ProgressBar />
 *       <VideoPlayer.ControlsRow>
 *         <VideoPlayer.PlayPauseButton />
 *         <VideoPlayer.TimeDisplay />
 *         <VideoPlayer.Spacer />
 *         <VideoPlayer.MuteButton />
 *         <VideoPlayer.DownloadButton onClick={handleDownload} />
 *       </VideoPlayer.ControlsRow>
 *     </VideoPlayer.Controls>
 *   </VideoPlayer.Container>
 *   <VideoPlayer.FileName>{fileName}</VideoPlayer.FileName>
 * </VideoPlayer.Provider>
 * ```
 */
export const VideoPlayer = {
	Provider: VideoPlayerProvider,
	Container,
	Video,
	LoadingOverlay,
	BufferingOverlay,
	PlayOverlay,
	Controls,
	ProgressBar,
	ControlsRow,
	PlayPauseButton,
	TimeDisplay,
	Spacer,
	MuteButton,
	DownloadButton,
	FileName,
}

// ============================================================================
// Convenience Component (backwards-compatible API)
// ============================================================================

interface VideoPlayerSimpleProps {
	src: string
	fileName: string
	onDownload: () => void
}

/**
 * Simple VideoPlayer component that uses the default layout.
 * For custom layouts, use the compound component pattern with VideoPlayer.Provider.
 */
export function VideoPlayerSimple({ src, fileName, onDownload }: VideoPlayerSimpleProps) {
	return (
		<div className="group relative inline-block max-w-md">
			<VideoPlayer.Provider src={src}>
				<VideoPlayer.Container>
					<VideoPlayer.Video />
					<VideoPlayer.LoadingOverlay />
					<VideoPlayer.BufferingOverlay />
					<VideoPlayer.PlayOverlay />
					<VideoPlayer.Controls>
						<VideoPlayer.ProgressBar />
						<VideoPlayer.ControlsRow>
							<VideoPlayer.PlayPauseButton />
							<VideoPlayer.TimeDisplay />
							<VideoPlayer.Spacer />
							<VideoPlayer.MuteButton />
							<VideoPlayer.DownloadButton onClick={onDownload} />
						</VideoPlayer.ControlsRow>
					</VideoPlayer.Controls>
				</VideoPlayer.Container>
				<VideoPlayer.FileName>{fileName}</VideoPlayer.FileName>
			</VideoPlayer.Provider>
		</div>
	)
}
