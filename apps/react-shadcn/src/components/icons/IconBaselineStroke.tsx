// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconBaselineStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m6 16 2.982-8.45c.927-2.625 1.39-3.937 2.072-4.303a2 2 0 0 1 1.892 0c.682.366 1.145 1.678 2.072 4.303L18 16M8 11h8m1 9H7"
				fill="none"
			/>
		</svg>
	)
}

export default IconBaselineStroke
