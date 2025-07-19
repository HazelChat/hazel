// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDrawPencilStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.012 13 8 14.693v5.538M9.012 13 12 8l2.988 5m-5.976 0h5.976m0 0L16 14.693v5.538m0 0a9.15 9.15 0 1 0-8 0m8 0a9.1 9.1 0 0 1-4 .919 9.1 9.1 0 0 1-4-.919"
				fill="none"
			/>
		</svg>
	)
}

export default IconDrawPencilStroke
