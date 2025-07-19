// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconScissorsLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m3 20.4 8.4-8.4m0 0L3 3.6m8.4 8.4 3.454 3.455M11.4 12l3.454-3.455m0 6.91a3.6 3.6 0 1 1 5.092 5.092 3.6 3.6 0 0 1-5.092-5.092Zm0-6.91a3.6 3.6 0 1 1 5.091-5.09 3.6 3.6 0 0 1-5.09 5.09Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScissorsLeftStroke
