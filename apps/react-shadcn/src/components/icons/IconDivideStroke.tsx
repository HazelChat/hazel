// icons/svgs/stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconDivideStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 12h14m-5.998 5.002a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Zm0-10.003a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDivideStroke
