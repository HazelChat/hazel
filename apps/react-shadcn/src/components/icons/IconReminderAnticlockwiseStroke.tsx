// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconReminderAnticlockwiseStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.07 3.693a15 15 0 0 0-.487 3.84c0 .339.284.448.56.51h.001m3.66.348a15 15 0 0 1-3.66-.348m0 0a8 8 0 1 1-1.06 5.908M14.001 15l-1.707-1.707a1 1 0 0 1-.293-.707V9"
				fill="none"
			/>
		</svg>
	)
}

export default IconReminderAnticlockwiseStroke
