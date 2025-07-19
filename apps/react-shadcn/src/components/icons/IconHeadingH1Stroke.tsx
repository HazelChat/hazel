// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadingH1Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h8m-8 6V6m8 12V6m7 12v-8c-.962.236-1.698.898-2.134 1.771M19 18h-2.5m2.5 0h2.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH1Stroke
