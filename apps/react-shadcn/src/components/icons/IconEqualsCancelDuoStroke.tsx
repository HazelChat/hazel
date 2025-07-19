// icons/svgs/duo-stroke/maths

import type React from "react"
import type { SVGProps } from "react"

export const IconEqualsCancelDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5 9h9.333M15 15h4m-.02-6H19M5 15h4.667"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 21 19 3"
				fill="none"
			/>
		</svg>
	)
}

export default IconEqualsCancelDuoStroke
