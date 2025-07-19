// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigUpDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19 9.805a61 61 0 0 0-4-.33v9.923c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437c-.214.109-.494.109-1.054.109h-2.8c-.56 0-.84 0-1.054-.11a1 1 0 0 1-.437-.436C9 20.238 9 19.958 9 19.398V9.475q-2.005.099-4 .33"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M19 9.805a35.3 35.3 0 0 0-6.307-6.558 1.11 1.11 0 0 0-1.386 0A35.3 35.3 0 0 0 5 9.805"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigUpDuoStroke
