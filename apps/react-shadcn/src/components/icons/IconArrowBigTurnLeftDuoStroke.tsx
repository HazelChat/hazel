// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigTurnLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.799 5a61 61 0 0 0-.33 4c7.534 0 11.534 2 11.534 10-3-4-7-4-11.535-4q.1 2.005.33 4"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M9.799 5a35.3 35.3 0 0 0-6.558 6.307 1.11 1.11 0 0 0 0 1.386A35.3 35.3 0 0 0 9.8 19"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigTurnLeftDuoStroke
