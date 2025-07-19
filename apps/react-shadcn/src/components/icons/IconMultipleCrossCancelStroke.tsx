// icons/svgs/stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconMultipleCrossCancelStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m6 18 6-6m0 0 6-6m-6 6L6 6m6 6 6 6"
				fill="none"
			/>
		</svg>
	)
}

export default IconMultipleCrossCancelStroke
