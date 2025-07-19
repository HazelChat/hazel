// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDoubleChevronLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 8a20.4 20.4 0 0 0-3.894 3.702.47.47 0 0 0 0 .596A20.4 20.4 0 0 0 17 16"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M11 8a20.4 20.4 0 0 0-3.894 3.702.47.47 0 0 0 0 .596A20.4 20.4 0 0 0 11 16"
				fill="none"
			/>
		</svg>
	)
}

export default IconDoubleChevronLeftDuoStroke
