// icons/svgs/stroke/sports

import type React from "react"
import type { SVGProps } from "react"

export const IconDumbbellStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9 11h6M5 9H4a2 2 0 1 0 0 4h1m14 0h1a2 2 0 1 0 0-4h-1m0 4V7a2 2 0 1 0-4 0v8a2 2 0 1 0 4 0zM7 17a2 2 0 0 0 2-2V7a2 2 0 1 0-4 0v8a2 2 0 0 0 2 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDumbbellStroke
