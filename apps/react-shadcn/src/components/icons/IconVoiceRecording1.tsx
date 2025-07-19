// icons/svgs/contrast/media

import type React from "react"
import type { SVGProps } from "react"

export const IconVoiceRecording1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M6 16a4.15 4.15 0 1 0 0-8.3A4.15 4.15 0 0 0 6 16Z" />
				<path fill="currentColor" d="M18 16a4.15 4.15 0 1 0 0-8.3 4.15 4.15 0 0 0 0 8.3Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 16a4.15 4.15 0 1 0 0-8.3A4.15 4.15 0 0 0 6 16Zm0 0h12m0 0a4.15 4.15 0 1 0 0-8.3 4.15 4.15 0 0 0 0 8.3Z"
			/>
		</svg>
	)
}

export default IconVoiceRecording1
