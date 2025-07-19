// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconGaugeSpeedometerStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.242 19.15a9.15 9.15 0 1 1 13.816 0M8.415 10.415l4.107 2.803a.938.938 0 1 1-1.304 1.305z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGaugeSpeedometerStroke
