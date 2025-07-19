// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeTwoArrowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 13.289a20.8 20.8 0 0 1 5.347-.202.625.625 0 0 1 .566.566A20.8 20.8 0 0 1 10.71 19M19 10.711a20.8 20.8 0 0 1-5.347.202.625.625 0 0 1-.566-.566A20.8 20.8 0 0 1 13.29 5"
				fill="none"
			/>
		</svg>
	)
}

export default IconMinimizeTwoArrowStroke
