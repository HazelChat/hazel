import { Attachment01, FaceSmile, Recording02 } from "@untitledui/icons"
import type { FormEvent } from "react"
import { Button } from "~/components/base/buttons/button"
import { ButtonUtility } from "~/components/base/buttons/button-utility"
import { TextAreaBase } from "~/components/base/textarea/textarea"
import { cx } from "~/utils/cx"

export interface MessageActionTextareaProps {
	className?: string
	textAreaClassName?: string
	onSubmit?: (message: string) => void
}

export const MessageActionTextarea = ({
	onSubmit,
	className,
	textAreaClassName,
	...props
}: MessageActionTextareaProps) => {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.target as HTMLFormElement)
		const message = formData.get("message") as string
		onSubmit?.(message)
	}

	return (
		<form
			className={cx("relative flex h-max items-center gap-3", className)}
			onSubmit={handleSubmit}
			{...props}
		>
			<TextAreaBase
				aria-label="Message"
				placeholder="Message"
				name="message"
				className={cx("h-32 w-full resize-none", textAreaClassName)}
			/>

			<ButtonUtility icon={Recording02} size="xs" color="tertiary" className="absolute top-2 right-2" />

			<div className="absolute right-3.5 bottom-2 flex items-center gap-2">
				<div className="flex items-center gap-0.5">
					<ButtonUtility icon={Attachment01} size="xs" color="tertiary" />
					<ButtonUtility icon={FaceSmile} size="xs" color="tertiary" />
				</div>

				<Button size="sm" color="link-color">
					Send
				</Button>
			</div>
		</form>
	)
}
