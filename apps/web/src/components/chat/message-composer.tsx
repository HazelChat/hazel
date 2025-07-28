import { useEffect, useRef, useState } from "react"
import { useChat } from "~/hooks/use-chat"
import { cn } from "~/lib/utils"

export function MessageComposer() {
	const { sendMessage, startTyping, stopTyping } = useChat()
	const [content, setContent] = useState("")
	const [isTyping, setIsTyping] = useState(false)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>()

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto"
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
		}
	}, [content])

	// Handle typing indicator
	useEffect(() => {
		if (content && !isTyping) {
			setIsTyping(true)
			startTyping()
		}

		if (isTyping) {
			// Clear existing timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
			}

			// Set new timeout to stop typing after 3 seconds
			typingTimeoutRef.current = setTimeout(() => {
				setIsTyping(false)
				stopTyping()
			}, 3000)
		}

		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
			}
		}
	}, [content, isTyping, startTyping, stopTyping])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!content.trim()) return

		sendMessage(content.trim())
		setContent("")

		// Stop typing indicator
		if (isTyping) {
			setIsTyping(false)
			stopTyping()
		}
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}

		// Focus back on textarea
		textareaRef.current?.focus()
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSubmit(e)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="border-t border-border p-4">
			<div className="relative">
				<textarea
					ref={textareaRef}
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type a message..."
					className={cn(
						"w-full resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12",
						"placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
						"min-h-[48px] max-h-[200px]",
					)}
					rows={1}
				/>
				<div className="absolute bottom-2 right-2 flex items-center gap-2">
					{/* File upload button placeholder */}
					<button
						type="button"
						className="p-2 text-muted-foreground hover:text-foreground transition-colors"
						onClick={() => console.log("File upload not implemented")}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
						</svg>
					</button>
					<button
						type="submit"
						disabled={!content.trim()}
						className={cn(
							"p-2 rounded-lg transition-colors",
							content.trim()
								? "bg-primary text-primary-foreground hover:bg-primary/90"
								: "bg-muted text-muted-foreground cursor-not-allowed",
						)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="22" x2="11" y1="2" y2="13" />
							<polygon points="22 2 15 22 11 13 2 9 22 2" />
						</svg>
					</button>
				</div>
			</div>
			<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
				<span>Press Enter to send, Shift+Enter for new line</span>
			</div>
		</form>
	)
}
