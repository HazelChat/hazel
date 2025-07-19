// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconActivityDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 12h3.28a1 1 0 0 0 .948-.684L9 3l6 18 2.772-8.316a1 1 0 0 1 .949-.684H22"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.228 11.316 9 3l6 18 2.772-8.316"
				fill="none"
			/>
		</svg>
	)
}

export default IconActivityDuoStroke
