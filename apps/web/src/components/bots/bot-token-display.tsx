import { useState } from "react"
import IconCopy from "~/components/icons/icon-copy"
import IconEye from "~/components/icons/icon-eye"
import IconEyeSlash from "~/components/icons/icon-eye-slash"
import IconWarning from "~/components/icons/icon-warning"
import { Button } from "~/components/ui/button"
import { toast } from "sonner"

interface BotTokenDisplayProps {
	token: string
}

export function BotTokenDisplay({ token }: BotTokenDisplayProps) {
	const [isVisible, setIsVisible] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(token)
			toast.success("Token copied to clipboard")
		} catch {
			toast.error("Failed to copy token")
		}
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Warning */}
			<div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
				<IconWarning className="mt-0.5 size-5 shrink-0 text-warning" />
				<p className="text-sm">
					<span className="font-medium text-warning">Save this token now.</span>{" "}
					<span className="text-fg">
						You won't be able to see it again after closing this dialog.
					</span>
				</p>
			</div>

			{/* Token display */}
			<div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
				<code className="flex-1 truncate font-mono text-sm text-fg">
					{isVisible ? token : "•".repeat(Math.min(40, token.length))}
				</code>
				<Button
					size="sm"
					intent="plain"
					onPress={() => setIsVisible(!isVisible)}
					aria-label={isVisible ? "Hide token" : "Show token"}
				>
					{isVisible ? <IconEyeSlash className="size-4" /> : <IconEye className="size-4" />}
				</Button>
				<Button size="sm" intent="plain" onPress={handleCopy} aria-label="Copy token">
					<IconCopy className="size-4" />
				</Button>
			</div>

			{/* Usage hint */}
			<p className="text-muted-fg text-sm">
				Use this token with the{" "}
				<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">@hazel/bot-sdk</code> to
				authenticate your application.
			</p>
		</div>
	)
}
