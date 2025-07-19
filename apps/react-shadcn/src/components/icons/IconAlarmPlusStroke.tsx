// icons/svgs/stroke/time

import type React from "react"
import type { SVGProps } from "react"

export const IconAlarmPlusStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 3 2 6m17-3 3 3M12 16v-3m0 0v-3m0 3H9m3 0h3m5 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAlarmPlusStroke
