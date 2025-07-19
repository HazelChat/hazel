// icons/svgs/contrast/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconMultipleCrossCancelCircle1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M2.85 12a9.15 9.15 0 1 0 18.3 0 9.15 9.15 0 0 0-18.3 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 15 3-3m0 0 3-3m-3 3L9 9m3 3 3 3m-3 6.15a9.15 9.15 0 1 1 0-18.3 9.15 9.15 0 0 1 0 18.3Z"
			/>
		</svg>
	)
}

export default IconMultipleCrossCancelCircle1
