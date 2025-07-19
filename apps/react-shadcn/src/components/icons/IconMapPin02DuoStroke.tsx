// icons/svgs/duo-stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPin02DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21v-8"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M17 8A5 5 0 1 1 7 8a5 5 0 0 1 10 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapPin02DuoStroke
