// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconQueueStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M3 15h18M3 20h18M6 10h12a3 3 0 1 0 0-6H6a3 3 0 0 0 0 6Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconQueueStroke
