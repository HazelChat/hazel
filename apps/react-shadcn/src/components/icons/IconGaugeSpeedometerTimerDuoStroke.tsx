// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconGaugeSpeedometerTimerDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2.85 12A9.15 9.15 0 1 0 12 2.85V6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m8.464 8.465 4.108 2.803a.94.94 0 0 1-1.006 1.585.9.9 0 0 1-.299-.28z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGaugeSpeedometerTimerDuoStroke
