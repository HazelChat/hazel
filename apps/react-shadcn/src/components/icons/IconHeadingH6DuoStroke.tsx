// icons/svgs/duo-stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadingH6DuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h8m-8 6V6m8 12V6"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 16a2 2 0 0 0 2 2h1a2 2 0 1 0 0-4h-1a2 2 0 0 0-2 2Zm0 0v-4a2 2 0 0 1 2-2h1a2 2 0 0 1 1.732 1"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH6DuoStroke
