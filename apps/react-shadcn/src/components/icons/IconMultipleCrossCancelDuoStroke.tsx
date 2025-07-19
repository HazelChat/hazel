// icons/svgs/duo-stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconMultipleCrossCancelDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 18 18 6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m6 6 12 12"
				fill="none"
			/>
		</svg>
	)
}

export default IconMultipleCrossCancelDuoStroke
