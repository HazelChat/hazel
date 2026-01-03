import { useCallback, useEffect, useRef, useState } from "react"
import { IconDownload } from "../icons/icon-download"
import { IconPlay } from "../icons/icon-play"
import IconVolume from "../icons/icon-volume"
import IconVolumeMute from "../icons/icon-volume-mute"

interface VideoPlayerProps {
	src: string
	fileName: string
	onDownload: () => void
}

function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
	const mins = Math.floor(seconds / 60)
	const secs = Math.floor(seconds % 60)
	return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function VideoPlayer({ src, fileName, onDownload }: VideoPlayerProps) {
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
			}, 3000)
		}
	}, [isPlaying, isDragging])

	useEffect(() => {
		resetHideControlsTimer()
		return () => {
			if (hideControlsTimeoutRef.current) {
				clearTimeout(hideControlsTimeoutRef.current)
			}
		}
	}, [resetHideControlsTimer])

	// Video event handlers
	const handleLoadedMetadata = () => {
		const video = videoRef.current
		if (video) {
			setDuration(video.duration)
			setIsLoading(false)
		}
	}

	const handleTimeUpdate = () => {
		const video = videoRef.current
		if (video && !isDragging) {
			setCurrentTime(video.currentTime)
		}
	}

	const handleEnded = () => {
		setIsPlaying(false)
		setShowControls(true)
	}

	const handleWaiting = () => setIsBuffering(true)
	const handleCanPlay = () => setIsBuffering(false)

	// Controls
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

	const handleProgressClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const video = videoRef.current
			const progressBar = progressRef.current
			if (!video || !progressBar) return

			const rect = progressBar.getBoundingClientRect()
			const clickX = e.clientX - rect.left
			const percentage = Math.max(0, Math.min(1, clickX / rect.width))
			const newTime = percentage * duration

			video.currentTime = newTime
			setCurrentTime(newTime)
		},
		[duration],
	)

	// Drag handling for progress bar
	const handleProgressDragStart = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			e.preventDefault()
			setIsDragging(true)
			handleProgressClick(e)
		},
		[handleProgressClick],
	)

	useEffect(() => {
		if (!isDragging) return

		const handleMouseMove = (e: MouseEvent) => {
			const video = videoRef.current
			const progressBar = progressRef.current
			if (!video || !progressBar) return

			const rect = progressBar.getBoundingClientRect()
			const clickX = e.clientX - rect.left
			const percentage = Math.max(0, Math.min(1, clickX / rect.width))
			const newTime = percentage * duration

			setCurrentTime(newTime)
		}

		const handleMouseUp = (e: MouseEvent) => {
			const video = videoRef.current
			const progressBar = progressRef.current
			if (!video || !progressBar) return

			const rect = progressBar.getBoundingClientRect()
			const clickX = e.clientX - rect.left
			const percentage = Math.max(0, Math.min(1, clickX / rect.width))
			video.currentTime = percentage * duration

			setIsDragging(false)
		}

		document.addEventListener("mousemove", handleMouseMove)
		document.addEventListener("mouseup", handleMouseUp)

		return () => {
			document.removeEventListener("mousemove", handleMouseMove)
			document.removeEventListener("mouseup", handleMouseUp)
		}
	}, [isDragging, duration])

	// Keyboard handler for progress bar
	const handleProgressKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const video = videoRef.current
			if (!video) return

			const step = duration * 0.05 // 5% of duration
			if (e.key === "ArrowRight" || e.key === "ArrowUp") {
				e.preventDefault()
				video.currentTime = Math.min(duration, video.currentTime + step)
			} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
				e.preventDefault()
				video.currentTime = Math.max(0, video.currentTime - step)
			}
		},
		[duration],
	)

	return (
		<div className="group relative inline-block max-w-md">
			{/* biome-ignore lint/a11y/noStaticElementInteractions: container for mouse tracking to show/hide controls */}
			<div
				className="relative overflow-hidden rounded-lg border border-border bg-black shadow-sm"
				onMouseMove={resetHideControlsTimer}
				onMouseLeave={() => isPlaying && setShowControls(false)}
			>
				{/* Video element */}
				{/** biome-ignore lint/a11y/useMediaCaption: video caption not required for chat attachments */}
				<video
					ref={videoRef}
					src={src}
					className="block max-h-80 w-full"
					preload="metadata"
					playsInline
					onLoadedMetadata={handleLoadedMetadata}
					onTimeUpdate={handleTimeUpdate}
					onEnded={handleEnded}
					onWaiting={handleWaiting}
					onCanPlay={handleCanPlay}
					onClick={togglePlay}
				/>

				{/* Loading overlay */}
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40">
						<div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
					</div>
				)}

				{/* Buffering overlay */}
				{isBuffering && !isLoading && (
					<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
					</div>
				)}

				{/* Play button overlay (when paused) */}
				{!isPlaying && !isLoading && (
					<button
						type="button"
						onClick={togglePlay}
						className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
						aria-label="Play video"
					>
						<div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-105">
							<IconPlay className="ml-0.5 size-6 text-gray-900" />
						</div>
					</button>
				)}

				{/* Control bar */}
				<div
					className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-2 transition-opacity duration-200 ${
						showControls || !isPlaying ? "opacity-100" : "pointer-events-none opacity-0"
					}`}
				>
					{/* Progress bar */}
					<div
						ref={progressRef}
						className="group/progress mb-2 h-1 cursor-pointer rounded-full bg-white/30 transition-all hover:h-1.5"
						onClick={handleProgressClick}
						onMouseDown={handleProgressDragStart}
						onKeyDown={handleProgressKeyDown}
						role="slider"
						aria-label="Video progress"
						aria-valuenow={currentTime}
						aria-valuemin={0}
						aria-valuemax={duration}
						tabIndex={0}
					>
						<div
							className="relative h-full rounded-full bg-white transition-all"
							style={{ width: `${progress}%` }}
						>
							{/* Thumb indicator */}
							<div className="absolute top-1/2 right-0 size-3 -translate-y-1/2 translate-x-1/2 scale-0 rounded-full bg-white shadow-md transition-transform group-hover/progress:scale-100" />
						</div>
					</div>

					{/* Controls row */}
					<div className="flex items-center gap-2">
						{/* Play/Pause */}
						<button
							type="button"
							onClick={togglePlay}
							className="flex size-7 items-center justify-center rounded text-white transition-colors hover:bg-white/20"
							aria-label={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? <PauseIcon className="size-4" /> : <IconPlay className="size-4" />}
						</button>

						{/* Time */}
						<span className="min-w-[70px] font-mono text-white/90 text-xs">
							{formatTime(currentTime)} / {formatTime(duration)}
						</span>

						<div className="flex-1" />

						{/* Mute */}
						<button
							type="button"
							onClick={toggleMute}
							className="flex size-7 items-center justify-center rounded text-white transition-colors hover:bg-white/20"
							aria-label={isMuted ? "Unmute" : "Mute"}
						>
							{isMuted ? (
								<IconVolumeMute className="size-4" />
							) : (
								<IconVolume className="size-4" />
							)}
						</button>

						{/* Download */}
						<button
							type="button"
							onClick={onDownload}
							className="flex size-7 items-center justify-center rounded text-white transition-colors hover:bg-white/20"
							aria-label="Download video"
						>
							<IconDownload className="size-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Filename */}
			<div className="mt-1 truncate text-muted-fg text-xs">{fileName}</div>
		</div>
	)
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
