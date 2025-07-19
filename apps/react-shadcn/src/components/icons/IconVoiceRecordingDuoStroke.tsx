// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconVoiceRecordingDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 16h12"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6 16a4.15 4.15 0 1 0 0-8.3A4.15 4.15 0 0 0 6 16Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18 16a4.15 4.15 0 1 0 0-8.3 4.15 4.15 0 0 0 0 8.3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconVoiceRecordingDuoStroke
