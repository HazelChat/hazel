// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowLeftDownDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.863 18.137 18.591 5.409"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.743 9.772a30.2 30.2 0 0 0-.152 7.797.95.95 0 0 0 .84.84c2.59.286 5.21.235 7.798-.152"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowLeftDownDuoStroke
