// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPinSlantStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m3.482 20.518 5.167-5.167m0 0c-1.556-1.556-2.974-3.234-4.294-4.993a.504.504 0 0 1 .047-.66 4.54 4.54 0 0 1 4.3-1.197c.715.177 1.458.004 1.865-.662l2.197-3.592a1.6 1.6 0 0 1 2.385-.396 38 38 0 0 1 5 5 1.6 1.6 0 0 1-.396 2.386l-3.592 2.196c-.666.407-.839 1.15-.662 1.865a4.54 4.54 0 0 1-1.197 4.3.505.505 0 0 1-.66.047c-1.76-1.32-3.437-2.738-4.993-4.294Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPinSlantStroke
