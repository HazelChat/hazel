// icons/svgs/stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconLogInLeftStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M13.189 9a15 15 0 0 1 2.654 2.556A.7.7 0 0 1 16 12m-2.812 3a15 15 0 0 0 2.655-2.556A.7.7 0 0 0 16 12m0 0H3m8-7.472A6 6 0 0 1 21 9v6a6 6 0 0 1-10 4.472"
				fill="none"
			/>
		</svg>
	)
}

export default IconLogInLeftStroke
