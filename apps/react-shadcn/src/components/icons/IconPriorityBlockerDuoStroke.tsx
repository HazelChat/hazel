// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconPriorityBlockerDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m8.5 15.5 7-7"
				fill="none"
			/>
		</svg>
	)
}

export default IconPriorityBlockerDuoStroke
