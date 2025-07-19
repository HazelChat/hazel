// icons/svgs/duo-stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconMicOffDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 12a8 8 0 0 1-8 8m0 0v2m0-2a8 8 0 0 1-2.091-.276m-3.566-2.067A7.98 7.98 0 0 1 4 12m5.172 2.828A4 4 0 0 1 8 12V7a4 4 0 1 1 8 0v1m-.29 5.5a4 4 0 0 1-2.21 2.21"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconMicOffDuoStroke
