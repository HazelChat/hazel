// icons/svgs/duo-stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconDivideDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				opacity=".28"
			>
				<path d="M13.002 17.002a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z" fill="none" />
				<path d="M13.002 6.999a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z" fill="none" />
			</g>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 12h14"
				fill="none"
			/>
		</svg>
	)
}

export default IconDivideDuoStroke
