// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconReminderClockwiseStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18.93 3.396c.328 1.254.492 2.545.488 3.84-.001.338-.284.448-.56.509h-.002m-3.66.348a15 15 0 0 0 3.66-.348m0 0a8 8 0 1 0 1.06 5.908M14 15l-1.707-1.707a1 1 0 0 1-.293-.707V9"
				fill="none"
			/>
		</svg>
	)
}

export default IconReminderClockwiseStroke
