// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowTurnLeftDownDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 20v-8c0-2.8 0-4.2.545-5.27a5 5 0 0 1 2.185-2.185C12.8 4 14.2 4 17 4h3"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M4 15.142a25.2 25.2 0 0 0 4.505 4.684.79.79 0 0 0 .99 0A25.2 25.2 0 0 0 14 15.142"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowTurnLeftDownDuoStroke
