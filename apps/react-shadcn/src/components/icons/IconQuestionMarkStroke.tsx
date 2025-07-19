// icons/svgs/stroke/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconQuestionMarkStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.728 9.272a4.272 4.272 0 1 1 6.595 3.586C13.185 13.596 12 14.644 12 16m0 3h.01"
				fill="none"
			/>
		</svg>
	)
}

export default IconQuestionMarkStroke
