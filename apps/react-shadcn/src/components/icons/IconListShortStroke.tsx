// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconListShortStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 9h16M4 14h8"
				fill="none"
			/>
		</svg>
	)
}

export default IconListShortStroke
