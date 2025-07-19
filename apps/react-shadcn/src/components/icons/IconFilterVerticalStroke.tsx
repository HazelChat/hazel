// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFilterVerticalStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M17 3v7m0 0a3 3 0 0 0-3 3v1a3 3 0 1 0 6 0v-1a3 3 0 0 0-3-3ZM7 16v5m10-1v1M7 3v3m0 0a3 3 0 0 0-3 3v1a3 3 0 1 0 6 0V9a3 3 0 0 0-3-3Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFilterVerticalStroke
