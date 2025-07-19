// icons/svgs/duo-stroke/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitCompareDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 15v-4a5 5 0 0 0-5-5M6 9v4a5 5 0 0 0 5 5"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M21 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconGitCompareDuoStroke
