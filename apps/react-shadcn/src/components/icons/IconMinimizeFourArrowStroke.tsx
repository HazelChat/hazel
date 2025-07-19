// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeFourArrowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 14.923a18.5 18.5 0 0 1 4.753-.179.555.555 0 0 1 .503.503A18.5 18.5 0 0 1 9.076 20M20 14.923a18.5 18.5 0 0 0-4.753-.179.555.555 0 0 0-.503.503 18.5 18.5 0 0 0 .18 4.753M9.076 4c.265 1.58.325 3.179.179 4.753a.555.555 0 0 1-.503.503A18.5 18.5 0 0 1 4 9.076m16 0c-1.58.266-3.179.326-4.753.18a.555.555 0 0 1-.503-.503A18.5 18.5 0 0 1 14.924 4"
				fill="none"
			/>
		</svg>
	)
}

export default IconMinimizeFourArrowStroke
