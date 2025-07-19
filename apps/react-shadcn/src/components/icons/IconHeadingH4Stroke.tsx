// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconHeadingH4Stroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M4 12h8m-8 6V6m8 12V6m5 4-.76 3.804A1 1 0 0 0 17.22 15H21m0 0v-3m0 3v3"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeadingH4Stroke
