// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconSearchZoomInStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m21 21-6.05-6.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9ZM10 13v-3m0 0V7m0 3H7m3 0h3"
				fill="none"
			/>
		</svg>
	)
}

export default IconSearchZoomInStroke
