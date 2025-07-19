// icons/svgs/duo-stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconPersonReclinedDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m6.837 8.635 3.53 6.114a2 2 0 0 0 2.732.732l2.494-1.44a1 1 0 0 1 1.283.244l3.427 4.307"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.837 4.647a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m14.982 18.475-.838.432a5 5 0 0 1-6.625-1.942L4.076 11"
				opacity=".28"
				fill="none"
			/>
		</svg>
	)
}

export default IconPersonReclinedDuoStroke
