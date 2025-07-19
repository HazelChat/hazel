// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconAwardMedalDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.365 14.473 18 22c-4.286-2.664-7.714-2.664-12 0l1.635-7.527"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 9A7 7 0 1 1 5 9a7 7 0 0 1 14 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAwardMedalDuoStroke
