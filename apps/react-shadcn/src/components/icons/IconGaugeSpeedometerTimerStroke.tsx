// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconGaugeSpeedometerTimerStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.85 12A9.15 9.15 0 1 0 12 2.85V6M8.464 8.464l4.108 2.804a.938.938 0 1 1-1.304 1.304z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGaugeSpeedometerTimerStroke
